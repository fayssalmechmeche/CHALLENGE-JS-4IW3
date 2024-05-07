import { Model, model, Schema } from 'mongoose';

export interface IUser {
  email: string;
  password: string;
  challenge: {
    email: {
      verified: boolean;
      token: string;
      expiresAt: Date;
    };
  };
}

const UserSchema: Schema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    challenge: {
      email: {
        verified: {
          type: Boolean,
          default: false,
        },
        token: {
          type: String,
        },
        expiresAt: {
          type: Date,
        },
      },
    },
  },
  { timestamps: true },
);

export const User: Model<IUser> = model<IUser>('User', UserSchema);
