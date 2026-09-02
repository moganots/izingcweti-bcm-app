import { ref, reactive, type UnwrapNestedRefs } from 'vue';

/**
 * Form error type
 */
export interface FormErrors {
    [field: string]: string[];
}

/**
 * Composable for form state management
 * Provides reactive form state, validation errors, and submission handling
 * 
 * @param initialValues - The initial values for the form fields
 */
export function useForm<T extends Record<string, any>>(initialValues: T) {
    // ============================================
    // State
    // ============================================
    const form = reactive<T>({ ...initialValues }) as UnwrapNestedRefs<T>;
    const isSubmitting = ref(false);
    const isDirty = ref(false);
    const errors = ref<FormErrors>({});
    const submitError = ref<string | null>(null);
    const isSubmitted = ref(false);

    // ============================================
    // Form Actions
    // ============================================

    /**
     * Reset form to initial values
     */
    function reset(): void {
        Object.assign(form, { ...initialValues });
        isDirty.value = false;
        errors.value = {};
        submitError.value = null;
        isSubmitted.value = false;
    }

    /**
     * Reset form with new initial values
     */
    function resetWith(newValues: T): void {
        Object.assign(form, { ...newValues });
        isDirty.value = false;
        errors.value = {};
        submitError.value = null;
        isSubmitted.value = false;
    }

    /**
     * Set a single field value
     * Fixed: Use bracket notation with type assertion for reactive object
     */
    function setField<K extends keyof T>(field: K, value: T[K]): void {
        (form as Record<string, any>)[field as string] = value;
        isDirty.value = true;
    }

    /**
     * Set multiple field values at once
     */
    function setFields(values: Partial<T>): void {
        Object.entries(values).forEach(([key, value]) => {
            (form as Record<string, any>)[key] = value;
        });
        isDirty.value = true;
    }

    /**
     * Get a single field value
     * Fixed: Use bracket notation with type assertion for reactive object
     */
    function getField<K extends keyof T>(field: K): T[K] {
        return (form as Record<string, any>)[field as string] as T[K];
    }

    /**
     * Get all form values as a plain object
     */
    function getValues(): T {
        return { ...form } as T;
    }

    /**
     * Set field-level validation errors
     */
    function setErrors(fieldErrors: FormErrors): void {
        errors.value = { ...errors.value, ...fieldErrors };
    }

    /**
     * Set error for a specific field
     */
    function setFieldError(field: keyof T, errorMessages: string[]): void {
        errors.value = {
            ...errors.value,
            [field as string]: errorMessages,
        };
    }

    /**
     * Add a single error message to a field
     */
    function addFieldError(field: keyof T, message: string): void {
        const currentErrors = errors.value[field as string] || [];
        errors.value = {
            ...errors.value,
            [field as string]: [...currentErrors, message],
        };
    }

    /**
     * Clear field-level errors
     * @param field - Optional field name to clear. If omitted, clears all errors.
     */
    function clearErrors(field?: keyof T): void {
        if (field) {
            const newErrors = { ...errors.value };
            delete newErrors[field as string];
            errors.value = newErrors;
        } else {
            errors.value = {};
        }
    }

    /**
     * Get errors for a specific field
     */
    function getFieldErrors(field: keyof T): string[] {
        return errors.value[field as string] || [];
    }

    /**
     * Check if a field has any errors
     */
    function hasFieldError(field: keyof T): boolean {
        return (errors.value[field as string]?.length || 0) > 0;
    }

    /**
     * Check if the form has any errors
     */
    function hasErrors(): boolean {
        return Object.keys(errors.value).length > 0;
    }

    /**
     * Get the first error message for a field
     */
    function getFirstFieldError(field: keyof T): string | null {
        const fieldErrors = errors.value[field as string];
        if (fieldErrors && fieldErrors.length > 0) {
            return fieldErrors[0]!;
        }
        return null;
    }

    /**
     * Set submit error message
     */
    function setSubmitError(message: string): void {
        submitError.value = message;
    }

    /**
     * Clear submit error
     */
    function clearSubmitError(): void {
        submitError.value = null;
    }

    /**
     * Mark form as submitting/not submitting
     */
    function setSubmitting(submitting: boolean): void {
        isSubmitting.value = submitting;
        if (submitting) {
            submitError.value = null;
        }
    }

    /**
     * Mark form as submitted
     */
    function setSubmitted(): void {
        isSubmitted.value = true;
    }

    /**
     * Handle form submission with validation
     * @param submitFn - The async function to call on submit
     * @param validateFn - Optional validation function that returns errors
     */
    async function handleSubmit(
        submitFn: (values: T) => Promise<void>,
        validateFn?: (values: T) => FormErrors,
    ): Promise<boolean> {
        isSubmitting.value = true;
        submitError.value = null;
        clearErrors();

        try {
            // Run validation if provided
            if (validateFn) {
                const validationErrors = validateFn(getValues());
                if (Object.keys(validationErrors).length > 0) {
                    setErrors(validationErrors);
                    return false;
                }
            }

            // Submit the form
            await submitFn(getValues());
            isSubmitted.value = true;
            return true;
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Form submission failed';
            setSubmitError(message);
            return false;
        } finally {
            isSubmitting.value = false;
        }
    }

    /**
     * Watch for changes and mark form as dirty
     */
    function markDirty(): void {
        isDirty.value = true;
    }

    /**
     * Check if a specific field has been modified from its initial value
     */
    function isFieldDirty<K extends keyof T>(field: K): boolean {
        return (form as Record<string, any>)[field as string] !== initialValues[field];
    }

    return {
        // State
        form,
        isSubmitting,
        isDirty,
        isSubmitted,
        errors,
        submitError,
        // Actions
        reset,
        resetWith,
        setField,
        setFields,
        getField,
        getValues,
        setErrors,
        setFieldError,
        addFieldError,
        clearErrors,
        getFieldErrors,
        hasFieldError,
        hasErrors,
        getFirstFieldError,
        setSubmitError,
        clearSubmitError,
        setSubmitting,
        setSubmitted,
        handleSubmit,
        markDirty,
        isFieldDirty,
    };
}