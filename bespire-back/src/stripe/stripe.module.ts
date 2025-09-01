import { Module } from '@nestjs/common';
// Importa ConfigModule y ConfigService
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { StripeController } from './stripe.controller';
import { StripeResolver } from './stripe.resolver';
import { StripeService } from './stripe.service';
import { UsersModule } from 'src/users/users.module';
import { PlansModule } from 'src/plans/plans.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';

@Module({
  imports: [
    UsersModule,
    PlansModule,
    WorkspaceModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [StripeController],
  providers: [StripeResolver, StripeService],
  exports: [StripeService], // Exporta StripeService para que pueda ser usado en otros módulos

  // exports: [JwtModule, JwtService] // o solo JwtService si eso es lo que se inyecta fuera
})
export class StripeModule {}
