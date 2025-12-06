import { validate, ValidationError } from 'class-validator';
import { plainToInstance, ClassConstructor } from 'class-transformer';

/**
 * Validation result
 */
export interface ValidationResult<T> {
    isValid: boolean;
    data?: T;
    errors?: FormattedValidationError[];
}

/**
 * Formatted validation error
 */
export interface FormattedValidationError {
    field: string;
    constraints: string[];
    value?: any;
}

/**
 * Validation helper class
 */
export class ValidationHelper {
    /**
     * Validate an object against a DTO class
     */
    static async validate<T extends object>(
        cls: ClassConstructor<T>,
        data: Record<string, any>
    ): Promise<ValidationResult<T>> {
        // Transform plain object to class instance
        const instance = plainToInstance(cls, data, {
            enableImplicitConversion: true,
            excludeExtraneousValues: false,
        });

        // Validate
        const errors = await validate(instance, {
            whitelist: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: false,
        });

        if (errors.length > 0) {
            return {
                isValid: false,
                errors: this.formatErrors(errors),
            };
        }

        return {
            isValid: true,
            data: instance,
        };
    }

    /**
     * Format validation errors
     */
    static formatErrors(errors: ValidationError[]): FormattedValidationError[] {
        return errors.map((error) => ({
            field: error.property,
            constraints: error.constraints ? Object.values(error.constraints) : [],
            value: error.value,
        }));
    }

    /**
     * Validate and throw if invalid
     */
    static async validateOrThrow<T extends object>(
        cls: ClassConstructor<T>,
        data: Record<string, any>
    ): Promise<T> {
        const result = await this.validate(cls, data);

        if (!result.isValid) {
            const error = new Error('Validation failed') as any;
            error.statusCode = 422;
            error.errors = result.errors;
            throw error;
        }

        return result.data!;
    }

    /**
     * Validate partial update (skip missing properties)
     */
    static async validatePartial<T extends object>(
        cls: ClassConstructor<T>,
        data: Record<string, any>
    ): Promise<ValidationResult<T>> {
        const instance = plainToInstance(cls, data, {
            enableImplicitConversion: true,
            excludeExtraneousValues: false,
        });

        const errors = await validate(instance, {
            whitelist: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: true, // Allow partial updates
        });

        if (errors.length > 0) {
            return {
                isValid: false,
                errors: this.formatErrors(errors),
            };
        }

        return {
            isValid: true,
            data: instance,
        };
    }

    /**
     * Check if email is valid format
     */
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Check if password meets requirements
     */
    static isValidPassword(password: string, options?: {
        minLength?: number;
        requireUppercase?: boolean;
        requireLowercase?: boolean;
        requireNumber?: boolean;
        requireSpecial?: boolean;
    }): { isValid: boolean; errors: string[] } {
        const {
            minLength = 8,
            requireUppercase = true,
            requireLowercase = true,
            requireNumber = true,
            requireSpecial = false,
        } = options || {};

        const errors: string[] = [];

        if (password.length < minLength) {
            errors.push(`Password must be at least ${minLength} characters long`);
        }

        if (requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (requireNumber && !/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * Sanitize string input
     */
    static sanitizeString(input: string): string {
        return input
            .trim()
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }

    /**
     * Validate UUID format
     */
    static isValidUUID(uuid: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    /**
     * Validate numeric ID
     */
    static isValidId(id: any): boolean {
        const numId = parseInt(id, 10);
        return !isNaN(numId) && numId > 0;
    }
}
