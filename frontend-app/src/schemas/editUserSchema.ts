import * as Yup from 'yup';

export const editUserSchema = Yup.object().shape({
    name: Yup.string()
        .required('Name is required')
        .min(2, 'Name must be at least 3 characters long')
        .max(50, 'Name must not exceed 50 characters'),
    email: Yup.string().email('Invalid email format').notRequired(),
    isAdmin: Yup.boolean().notRequired(),
});