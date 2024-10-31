import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Subscription extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: Object, required: true }) 
  subscription: Record<string, any>;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
