import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Role } from "../entities/role.entity";
import { Model } from "mongoose";

@Injectable()
export class RoleSeeder implements OnModuleInit {

  constructor(@InjectModel(Role.name) private readonly roleModel: Model<Role>) {
  }

  async onModuleInit() {
    await this.roleSeeder();
  }

  async roleSeeder() {
    const roles = [
      {
        role_name: 'Admin',
        permissions: [
          { permission: 'manage_users' },
          { permission: 'manage_pharmacies' },
          { permission: 'manage_doctors' },
          { permission: 'manage_articles' },
          { permission: 'manage_roles' },
          { permission: 'view_analytics' },
        ],
      },
      {
        role_name: 'User',
        permissions: [
          { permission: 'search_pharmacies' },
          { permission: 'view_products' },
          { permission: 'read_articles' },
          { permission: 'manage_own_profile' },
        ]
      },
      {
        role_name: 'Pharmacy',
        permissions: [
          { permission: 'manage_products' },
          { permission: 'update_schedule' },
          { permission: 'manage_inventory' },
          { permission: 'view_notifications' },
          { permission: 'manage_own_profile' },
          { permission: 'manage_helpers' },
          { permission: 'view_analytics' },
          { permission: 'manage_pharmacy_settings' },
        ]
      },
      {
        role_name: 'Pharmacy_Helper',
        permissions: [
          { permission: 'view_products' },
          { permission: 'update_inventory' },
          { permission: 'view_schedule' },
          { permission: 'view_notifications' },
          { permission: 'manage_own_profile' },
          { permission: 'view_notifications' },
        ]
      },
      {
        role_name: 'Doctor',
        permissions: [
          { permission: 'publish_articles' },
          { permission: 'manage_own_profile' },
          { permission: 'view_patient_info' },
        ]
      }
    ];

    const existingRoles = await this.roleModel.find().exec();
    if (existingRoles.length === 0) {
      await this.roleModel.insertMany(roles);
      console.log('Roles seeded successfully!');
    }else {
      console.log('Roles already exist, skipping seeding.');
    }
  }
}
