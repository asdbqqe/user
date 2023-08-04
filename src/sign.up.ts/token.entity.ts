import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TokenType = 'refreshtoken' | 'accessToken' | 'confirmToken';

@Schema()
export class Token extends Document {
  @Prop({ default: '' })
  token: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: string;

  @Prop({ enum: ['refreshtoken', 'accessToken', 'confirmToken'] })
  type: TokenType;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
