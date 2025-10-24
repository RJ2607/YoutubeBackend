export class ApiResponse<T> {
  status: Status;
  message?: string;
  result?: T;
  count?: number;

  constructor({
    status,
    message,
    result,
    count,
  }: {
    status: Status;
    message?: string;
    result?: T;
    count?: number;
  }) {
    this.status = status;
    this.message = message;
    this.result = result;
    this.count = count;
  }

  static fromJson<T>(json: any): ApiResponse<T> {
    return new ApiResponse<T>({
      status: Status.fromJson(json["status"]),
      message: json["message"],
      result: json["result"],
      count: json["count"],
    });
  }

  static dioError(message: string = ""): ApiResponse<null> {
    return new ApiResponse<null>({
      status: new Status({ code: "-1", error: true }),
      message: message,
    });
  }
}

export class Status {
  code: string;
  error: boolean;

  constructor({ code = "-1", error = false }: { code?: string; error?: boolean }) {
    this.code = code;
    this.error = error;
  }

  static fromJson(json: any): Status {
    return new Status({
      code: String(json["code"]),
      error: Boolean(json["error"]),
    });
  }
}
