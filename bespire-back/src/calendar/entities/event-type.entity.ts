import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class EventTypeEntity {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  backgroundColor: string;

  @Field()
  borderColor: string;
}
