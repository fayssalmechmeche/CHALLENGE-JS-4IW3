import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { ChallengeRepository } from '../../app/repositories/sql/ChallengeRepository';
import { UserRepository } from '../../app/repositories/sql/UserRepository';
import {
  ACCOUNT_LOCKED_TEMPLATE_ID,
  MAX_PASSWORD_ATTEMPTS,
  MINUTES_TO_UNLOCK,
  SessionService,
} from '../../app/services/SessionService';
import { UserService } from '../../app/services/UserService';
import { User } from '../../app/models/sql/User';
import { Challenge } from '../../app/models/sql/Challenge';
import bcrypt from 'bcrypt';
import { PostmarkClient } from '../../app/helpers/postmark';

use(chaiAsPromised);

beforeEach(() => {
  sinon.restore();
});

describe('SessionService', () => {
  const USER = {
    email: 'john.doe@gmail.com',
    password: 'MySuperSecurePassword123!',
  } as User;
  const CHALLENGE = { disabled: true } as Challenge;

  describe('login', () => {
    it('should return a token when the user is authenticated', async () => {
      sinon.stub(UserRepository, 'findByEmail').resolves(USER);
      sinon.stub(ChallengeRepository, 'findByUserAndType').resolves(CHALLENGE);
      sinon.stub(bcrypt, 'compare').resolves(true);
      sinon.stub(UserService, 'generateAuthToken').returns('token');

      await expect(SessionService.login(USER.email, USER.password)).to.be
        .fulfilled;
      expect(
        SessionService.login(USER.email, USER.password),
      ).to.eventually.deep.equal({ token: 'token' });
    });

    it('should throw an error when the user is not found', async () => {
      sinon.stub(UserRepository, 'findByEmail').resolves(null);

      await expect(
        SessionService.login(USER.email, USER.password),
      ).to.be.rejectedWith('invalid_credentials');
    });

    it('should throw an error when the challenge is not found', async () => {
      sinon.stub(UserRepository, 'findByEmail').resolves(USER);
      sinon.stub(ChallengeRepository, 'findByUserAndType').resolves(null);

      await expect(SessionService.login(USER.email, USER.password)).to.be
        .rejected;
    });

    it('should throw an error when the challenge is not disabled', async () => {
      sinon.stub(UserRepository, 'findByEmail').resolves(USER);
      sinon.stub(ChallengeRepository, 'findByUserAndType').resolves({
        disabled: false,
      } as Challenge);

      await expect(
        SessionService.login(USER.email, USER.password),
      ).to.be.rejectedWith('email_not_verified');
    });

    it('should throw an error when the password is incorrect', async () => {
      sinon.stub(UserRepository, 'findByEmail').resolves(USER);
      sinon.stub(ChallengeRepository, 'findByUserAndType').resolves(CHALLENGE);
      sinon.stub(bcrypt, 'compare').resolves(false);

      await expect(
        SessionService.login(USER.email, USER.password),
      ).to.be.rejectedWith('invalid_credentials');
    });

    it('should throw an error when the account is locked', async () => {
      const dateInFuture = new Date(Date.now() + 60 * 15 * 1000);

      sinon
        .stub(UserRepository, 'findByEmail')
        .resolves({ ...USER, locked: true, unlockedAt: dateInFuture } as User);
      sinon.stub(ChallengeRepository, 'findByUserAndType').resolves(CHALLENGE);

      await expect(
        SessionService.login(USER.email, USER.password),
      ).to.be.rejectedWith('account_locked');
    });

    it('should unlock the account once the unlock date is reached', async () => {
      const dateInPast = new Date(Date.now() - 60 * 15 * 1000);

      sinon
        .stub(UserRepository, 'findByEmail')
        .resolves({ ...USER, locked: true, unlockedAt: dateInPast } as User);
      sinon.stub(ChallengeRepository, 'findByUserAndType').resolves(CHALLENGE);
      sinon.stub(bcrypt, 'compare').resolves(true);
      sinon.stub(UserService, 'generateAuthToken').returns('token');

      await expect(SessionService.login(USER.email, USER.password)).to.be
        .fulfilled;
    });

    it('should send the account locked email when the account is locked', async () => {
      sinon.stub(UserRepository, 'findByEmail').resolves({
        ...USER,
        locked: false,
        passwordAttempts: MAX_PASSWORD_ATTEMPTS,
      } as User);
      sinon.stub(ChallengeRepository, 'findByUserAndType').resolves(CHALLENGE);
      const sendEmail = sinon
        .mock(PostmarkClient)
        .expects('sendEmail')
        .withExactArgs(USER.email, ACCOUNT_LOCKED_TEMPLATE_ID, {
          email: USER.email,
          minutes: MINUTES_TO_UNLOCK,
        });

      await expect(
        SessionService.login(USER.email, USER.password),
      ).to.be.rejectedWith('account_locked');

      sendEmail.verify();
    });
  });
});
