import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ unique: true, lowercase: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Array, default: ['user'] })
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
