// src/common/utils/log-graphql.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { GraphQLSchemaHost } from '@nestjs/graphql';

@Injectable()
export class GraphQLOpsLogger implements OnModuleInit {
  constructor(private readonly gqlSchemaHost: GraphQLSchemaHost) {}

  onModuleInit() {
    const schema = this.gqlSchemaHost.schema;
    const q = schema.getQueryType()?.getFields() ?? {};
    const m = schema.getMutationType()?.getFields() ?? {};
    const s = schema.getSubscriptionType()?.getFields() ?? {};

    const list = (obj: Record<string, any>) => Object.keys(obj).sort();

    console.log('[GraphQL] Path:', (schema as any).__path ?? '/graphql');
    console.log('[GraphQL] Queries:', list(q).join(', ') || '(ninguna)');
    console.log('[GraphQL] Mutations:', list(m).join(', ') || '(ninguna)');
    console.log('[GraphQL] Subscriptions:', list(s).join(', ') || '(ninguna)');
  }
}
