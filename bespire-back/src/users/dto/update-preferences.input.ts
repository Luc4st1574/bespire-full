// src/users/dto/update-preferences.input.ts
import { InputType, Field } from '@nestjs/graphql';

@InputType()
class ChannelsInput {
  @Field({ nullable: true }) email?: boolean;
  @Field({ nullable: true }) inApp?: boolean;
  @Field({ nullable: true }) push?: boolean;
}

@InputType()
class SpecificNotificationsInput {
  @Field({ nullable: true }) requestsAlert?: boolean;
  @Field({ nullable: true }) brandsUpdate?: boolean;
  @Field({ nullable: true }) filesUpdate?: boolean;
  @Field({ nullable: true }) mentionsComments?: boolean;
  @Field({ nullable: true }) sharedItems?: boolean;
  @Field({ nullable: true }) lowOnCredits?: boolean;
  @Field({ nullable: true }) paymentAlerts?: boolean;
}

@InputType()
export class UpdatePreferencesInput {
  @Field({ nullable: true }) timezone?: string;

  @Field({ nullable: true }) notifications?: boolean;

  @Field((type) => ChannelsInput, { nullable: true }) channels?: ChannelsInput;

  @Field({ nullable: true }) newsletter?: boolean;

  @Field((type) => SpecificNotificationsInput, { nullable: true })
  specific?: SpecificNotificationsInput;

  @Field({ nullable: true }) hideQuickLinks?: boolean; // Si quieres legacy
  @Field({ nullable: true }) hideGetStarted?: boolean; // Si quieres legacy
}
