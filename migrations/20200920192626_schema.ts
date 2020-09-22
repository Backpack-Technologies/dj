import * as Knex from 'knex'
import dotenv from 'dotenv'

dotenv.config()

export async function up (knex: Knex): Promise<void[]> {
  return Promise.all([
    // creating tables
    knex.schema
      .createTable('users', table => {
        table.increments('id')
        table.string('name', 255).notNullable()
        table.string('email', 255).notNullable()
        table.string('pass', 255).notNullable()
        table.string('role', 10).defaultTo('user') // user, manager, admin
        table.integer('pref_working_hr').defaultTo(0)
        table.timestamps(true, true)

        table.unique(['email'])
        table.engine('InnoDB')
      })
      .createTable('records', table => {
        table.increments('id')
        table.integer('user_id').unsigned().notNullable()
        table.text('work_description').notNullable()
        table.integer('work_duration_hr').notNullable()
        table.date('work_date').notNullable()
        table.timestamps(true, true)

        table.foreign('user_id').references('id').inTable('users')
        table.engine('InnoDB')
      }),

    // creating admin user
    knex('users').insert({
      name: 'Admin',
      email: 'admin@admin.com',
      pass: process.env.ADMIN_USER_PASS,
      role: 'admin'
    })
  ])
}

export async function down (knex: Knex): Promise<void> {
  return knex.schema
    .dropTable('records')
    .dropTable('users')
}
