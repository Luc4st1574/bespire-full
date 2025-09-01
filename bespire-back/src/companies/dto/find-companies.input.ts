import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class FindCompaniesInput {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @Min(0)
  skip?: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @Min(1)
  limit?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}
