/* eslint-disable no-unused-vars */

export enum UserRole {
    USER = 'user',
    MANAGER = 'manager',
    ADMIN = 'admin'
}

export enum Resource {
    USERS = 'users',
    RECORDS = 'records'
}

export interface User {
    id?: number
    name?: string
    email?: string
    pass?: string
    role?: UserRole | string
    prefWorkingHours?: number
    createdAt?: Date
}

export interface RecordType {
    id?: number
    userId?: number
    workDescription?: string
    workDurationHours?: number
    workDate?: Date
    createdAt?: Date
}
