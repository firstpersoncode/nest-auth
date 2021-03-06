import { Injectable, UnauthorizedException } from '@nestjs/common'

import { UserEntity }  from '../user/user.entity'
import { UserService } from '../user/user.service'

import { AuthLogin } from './dtos/auth.login.dto'
import { BaseGuard } from './guards/base.guard'

@Injectable()
export class AuthService extends BaseGuard {
	constructor (private readonly userService: UserService) {
		super()
	}
	
	async login ({ email, password }: AuthLogin): Promise<string> {
		const user          = await this.userService.queryByEmail(email)
		const passwordMatch = await user.checkPassword(password)
		
		if (!passwordMatch) {
			throw new UnauthorizedException(`Wrong password for user with email: ${ email }`)
		}
		
		return this.signToken(user)
	}
	
	async logout (sign: string): Promise<boolean> {
		const token = await this.getToken(sign)
		await token.remove()
		
		return true
	}
	
	async session (sign: string): Promise<UserEntity> {
		const token   = await this.getToken(sign)
		const payload = await this.verifyToken(token)
		
		return await this.getSession(payload)
	}
}
