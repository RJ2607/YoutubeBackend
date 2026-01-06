import jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import { ApiResponse, ErrorCode } from "../../helper/response";
import RedisDatabaseObject from "../../redis/redis-connection";
import { User } from "./user.entity";

export class UserService {
  userRepo: Repository<User>;
  
  constructor(userRepo: Repository<User>) {
    this.userRepo = userRepo;
  }

  async generateToken(user: User) {
    const tid = crypto.randomUUID();
    const refreshTokenId = crypto.randomUUID();
    const tokenExpiry = 2 * 3600;
    const refreshExpiry = 30 * 24 * 60 * 60;

    const token = jwt.sign(
      { 
        sub: user.id, 
        userId: user.id, 
        email: user.email,
        fullName: user.fullName,
        tid 
      }, 
      process.env.JWT_SECRET_KEY,
      {
        algorithm: "HS256",
        expiresIn: tokenExpiry,
      }
    );

    const refreshToken = jwt.sign(
      { 
        tid: refreshTokenId, 
        userId: user.id 
      }, 
      process.env.REFRESH_SECRET_KEY,
      {
        algorithm: "HS256",
        expiresIn: refreshExpiry,
      }
    );

    const { connection } = await RedisDatabaseObject;
    await connection.set(
      `refresh-token:${refreshTokenId}`, 
      JSON.stringify({ userId: user.id }), 
      "EX", 
      refreshExpiry
    );

    return new ApiResponse({
      status: { code: ErrorCode.Success, error: false },
      message: "Tokens generated successfully",
      result: {
        accessToken: token,
        refreshToken: refreshToken,
        expiresIn: tokenExpiry,
        type: "Bearer",
      },
    });
  }

  async refreshToken(refreshToken: string): Promise<
    ApiResponse<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      type: string;
    }>
  > {
    try {
      const { connection } = await RedisDatabaseObject;
      
      const decoded = jwt.verify(
        refreshToken, 
        process.env.REFRESH_SECRET_KEY,
        {
          algorithms: ["HS256"],
        }
      ) as { tid: string; userId: string };

      const token = await connection.get(`refresh-token:${decoded.tid}`);

      if (!token) {
        return new ApiResponse({
          status: { code: ErrorCode.NotAuthorized, error: true },
          message: "Invalid refresh token",
        });
      }

      const values = JSON.parse(token);
      const user = await this.userRepo.findOneBy({ id: values.userId });

      if (!user) {
        return new ApiResponse({
          status: { code: ErrorCode.NotAuthorized, error: true },
          message: "Invalid user",
        });
      }
      await connection.del(`refresh-token:${decoded.tid}`);

      return this.generateToken(user);
    } catch (error) {
      return new ApiResponse({
        status: { code: ErrorCode.InternalServerError, error: true },
        message: "Error in refreshing token",
      });
    }
  }

  async invalidateToken(refreshToken: string): Promise<ApiResponse<boolean>> {
    try {
      const { connection } = await RedisDatabaseObject;

      const decoded = jwt.verify(
        refreshToken, 
        process.env.REFRESH_SECRET_KEY,
        {
          algorithms: ["HS256"],
        }
      ) as { tid: string; userId: string };

      const token = await connection.get(`refresh-token:${decoded.tid}`);
      
      if (!token) {
        return new ApiResponse({ 
          status: { code: ErrorCode.NotAuthorized, error: true }, 
          message: "Invalid refresh token" 
        });
      }
      
      await connection.del(`refresh-token:${decoded.tid}`);

      return new ApiResponse({ 
        status: { code: ErrorCode.Success, error: false }, 
        message: "Token invalidated", 
        result: true 
      });
    } catch (error) {
      return new ApiResponse({ 
        status: { code: ErrorCode.InternalServerError, error: true }, 
        message: "Error in invalidating token" 
      });
    }
  }

  decodeToken(token: string) {
    try {
      const decoded = jwt.decode(token) as {
        userId: string;
        isAdmin: boolean;
        tid: string;
      };

      return new ApiResponse({
        status: { code: ErrorCode.Success, error: false },
        message: "Token Decoded",
        result: {
          userId: decoded.userId,
          isAdmin: decoded.isAdmin,
        },
      });
    } catch (error) {
      return new ApiResponse({ 
        status: { code: ErrorCode.BadRequest, error: false }, 
        message: "Error in verifying token" 
      });
    }
  }
}