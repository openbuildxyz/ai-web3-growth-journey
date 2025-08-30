/**
 * A base error for all custom errors in the application.
 * This allows for easy identification of application-specific errors.
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}

/**
 * Represents an error related to network connectivity issues, such as
 * the user being offline or a DNS failure.
 */
export class NetworkError extends AppError {
  constructor(message = '网络连接失败，请检查您的网络设置。') {
    super(message);
  }
}

/**
 * Represents an error due to an invalid, expired, or missing API key.
 * This typically corresponds to HTTP 401 or 403 status codes.
 */
export class ApiKeyError extends AppError {
  constructor(message = 'API Key 无效或已过期，请检查后重试。') {
    super(message);
  }
}

/**
 * Represents a server-side error (HTTP 5xx status codes).
 * This indicates a problem with the remote service, not the client.
 */
export class ServerError extends AppError {
  constructor(message = '分析服务暂时不可用，请稍后再试。') {
    super(message);
  }
}

/**
 * Represents a request that has timed out.
 */
export class TimeoutError extends AppError {
  constructor(message = '分析请求超时，请稍后重试。') {
    super(message);
  }
}

/**
 * Represents an error in parsing or validating the structure of the LLM response.
 * This can happen if the response is not valid JSON or is missing expected fields.
 */
export class BadResponseError extends AppError {
  constructor(message = '无法从分析服务解析响应。') {
    super(message);
  }
}