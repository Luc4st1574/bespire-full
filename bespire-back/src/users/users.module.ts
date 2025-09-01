import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import {
  Workspace,
  WorkspaceSchema,
} from 'src/workspace/schema/workspace.schema';
import { JwtModule } from '@nestjs/jwt';
// Importa ConfigModule y ConfigService
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { PlansModule } from 'src/plans/plans.module';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { RequestsModule } from 'src/requests/requests.module';

// Import new services
import { UserAuthService } from './services/user-auth.service';
import { UserManagementService } from './services/user-management.service';
import { ClientManagementService } from './services/client-management.service';
import { CompanyManagementService } from './services/company-management.service';
import { AuthenticationService } from './services/authentication.service';

@Module({
  imports: [
    forwardRef(() => WorkspaceModule),
    CompaniesModule,
    PlansModule,
    ReviewsModule,
    RequestsModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
    ]),
    // CAMBIA register POR registerAsync
    JwtModule.registerAsync({
      // Importa ConfigModule aquí (aunque es global, es buena práctica explicitar la dependencia)
      imports: [ConfigModule],
      // usa useFactory para definir cómo se configura el módulo
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Usa ConfigService para obtener el secret
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'), // Usa ConfigService para el expiresIn
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    UsersResolver,
    UsersService,
    MailService,
    UserAuthService,
    UserManagementService,
    ClientManagementService,
    CompanyManagementService,
    AuthenticationService,
  ],
  exports: [
    UsersService,
    UserAuthService,
    UserManagementService,
    ClientManagementService,
    CompanyManagementService,
    AuthenticationService,
  ],
  // exports: [JwtModule, JwtService] // o solo JwtService si eso es lo que se inyecta fuera
})
export class UsersModule {}
