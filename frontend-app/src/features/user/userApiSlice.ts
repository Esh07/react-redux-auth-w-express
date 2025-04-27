// Need to use the React-specific entry point to import `createApi`
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../../types';
import { apiSlice } from '../../app/api/apiSlice';


export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: build => ({
    getProfile: build.query<UserProfile, void>({
      query: credentials => ({
        url: '/user/profile',
        method: 'GET',
        body: credentials,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }),

    }),
    updateUserProfile: build.mutation<UserProfile, Partial<UserProfile>>({
      query: (userProfile) => ({
        url: '/user/profile',
        method: 'PUT',
        body: userProfile,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }),
    }),
    // Update user by ID (for admin or user with the correct permissions)
    updateUserById: build.mutation<UserProfile, { id: string, userProfile: Partial<UserProfile> }>({
      query: ({ id, userProfile }) => ({
        url: `/user/${id}`,
        method: 'PUT',
        body: userProfile,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }),
    }),
    deleteUserById: build.mutation<void, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }),
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateUserByIdMutation,
  useDeleteUserByIdMutation,
} = userApiSlice;