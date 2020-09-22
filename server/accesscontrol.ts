import { AccessControl } from 'accesscontrol'
import { UserRole, Resource } from './types'

const ac = new AccessControl()

// user
ac.grant(UserRole.USER)
  .createOwn(Resource.USERS)
  .readOwn(Resource.USERS)
  .updateOwn(Resource.USERS)
  .deleteOwn(Resource.USERS)
  .createOwn(Resource.RECORDS)
  .readOwn(Resource.RECORDS)
  .updateOwn(Resource.RECORDS)
  .deleteOwn(Resource.RECORDS)

// manager
ac.grant(UserRole.MANAGER)
  .extend(UserRole.USER)
  .createAny(Resource.USERS)
  .readAny(Resource.USERS)
  .updateAny(Resource.USERS)
  .deleteAny(Resource.USERS)

// admin
ac.grant(UserRole.ADMIN)
  .extend(UserRole.MANAGER)
  .createAny(Resource.RECORDS)
  .readAny(Resource.RECORDS)
  .updateAny(Resource.RECORDS)
  .deleteAny(Resource.RECORDS)

export default ac
