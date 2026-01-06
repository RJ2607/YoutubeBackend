export class ApiResponse<T> {
  status: Status;
  message?: string;
  result?: T;
  count?: number;

  constructor({ status, message, result, count }: { status: Status; message?: string; result?: T; count?: number }) {
    this.status = status;
    this.message = message;
    this.result = result;
    this.count = count;
  }

  static dioError(message: string = ""): ApiResponse<null> {
    return new ApiResponse<null>({
      status: new Status({ code: ErrorCode.Test, error: true }),
      message: message,
    });
  }
}

export class Status {
  code: ErrorCode;
  error: boolean;

  constructor({ code = ErrorCode.Test, error = false }: { code?: ErrorCode; error?: boolean }) {
    this.code = code;
    this.error = error;
  }
}

export declare enum ErrorCode {
  Success = "200",
  Created = "201",
  BadRequest = "400",
  NotAuthorized = "401",
  NotFound = "404",
  NoUpdatesPerformed = "405",
  InternalServerError = "500",
  Test = "-1",
}
