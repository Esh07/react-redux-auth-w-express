import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, selectCurrentToken, setUserDetails, selectUserDetails, selectUsers } from "./authSlice";
import LogoutButton from "../../../src/components/LogoutButton";
import { useGetUserDetailsQuery } from "./authApiSlice";
import ProfileCard from "../../../src/components/ProfileCard";
import { PencilSquareIcon, UserMinusIcon } from '@heroicons/react/24/outline'
import * as Yup from 'yup';
import { useUpdateUserProfileMutation } from "../user/userApiSlice";
import { Notification } from "../../../src/components/Notification";
import { formatDate, isEqualValues } from "../../../src/utils/helpers";
import { editUserSchema } from "../../../src/schemas/editUserSchema";
import EditUserModal from "../../components/admin/EditUserModal";
import type { userDetailsTypes } from "../../../src/types";


const Dashboard: React.FC = () => {

    const dispatch = useDispatch();
    const token = useSelector(selectCurrentToken);
    const userDetails = useSelector(selectUserDetails);

    const [searchQuery, setSearchQuery] = useState('');
    const [isViewingProfile, setIsViewingProfile] = useState(true);

    const [initialUserState, setInitialUserState] = useState<Partial<userDetailsTypes> | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [notification, setNotification] = useState<{
        isVisible: boolean;
        type: 'success' | 'error' | 'info' | undefined;
        title: string;
        message: string;
        duration: number;
    }>({
        isVisible: false,
        type: undefined, // e.g., 'success', 'error', 'info'
        title: '',
        message: '',
        duration: 3000,
    });



    const { data: selfDetails, error, isLoading, refetch } = useGetUserDetailsQuery(
        undefined,
        {
            skip: !token,
            refetchOnMountOrArgChange: true,
        }
    );

    // Send edit user data to the server (update user profile)
    const [updateUserProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();


    // Update the Redux store with user details when data is fetched
    useEffect(() => {
        if (selfDetails) {
            console.log("Fetching selfDetails", selfDetails);
            dispatch(setUserDetails(selfDetails));
        }
    }, [selfDetails, dispatch]);

    useEffect(() => {
        if (notification.isVisible) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, isVisible: false });
            }, notification.duration);

            return () => clearTimeout(timer);
        }
    }, [notification]);


    const [editedUser, setEditedUser] = useState<any>(null);


    // Handle loading and error states
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data</div>;

    const filteredUsers = userDetails?.users?.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );




    function openEditModal(user: any) {
        setEditedUser(user);
        setInitialUserState(user);
        setIsEditModalOpen(true);
        console.log("Opening edit modal for user:", user);
    }

    function closeEditModal() {

        // DO not close the modal if there are unsaved changes
        if (initialUserState && !isEqualValues(initialUserState, editedUser)) {
            const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to discard them?");
            console.log("User confirmed close:", confirmClose);
            if (confirmClose) {
                setIsEditModalOpen(false); // Close if confirmed
            }
        } else {
            setIsEditModalOpen(false); // Close modal if no unsaved changes
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {

            // validate the form data with Yup
            await editUserSchema.validate(editedUser, { abortEarly: false });
            // If validation passes, proceed with the update logic
            setIsEditModalOpen(false);

            // use the updateUserProfile mutation to send the data to the server

            const updatedUser = await updateUserProfile(editedUser).unwrap();
            console.log('User updated successfully:', updatedUser);
            setNotification({
                isVisible: true,
                type: 'success',
                title: 'Success!',
                message: 'User updated successfully.',
                duration: 5000, // Show for 5 seconds
            });


            // shoot a toast notification with success message with tailwindcss
            alert("User updated successfully");
            // refetch the user details to get the updated data
            refetch();


        } catch (error) {
            setNotification({
                isVisible: true,
                type: 'error',
                title: 'Validation Error',
                message: `Please fix the errors in the form. ${error}`,
                duration: 3000,
            });

            if (error instanceof Yup.ValidationError) {
                setNotification({
                    isVisible: true,
                    type: 'error',
                    title: 'Validation Error',
                    message: 'Please fix the errors in the form.',
                    duration: 3000,
                });
                const errors: Record<string, string> = {};
                error.inner.forEach((err) => {
                    if (err.path) errors[err.path] = err.message;
                });
                setFormErrors(errors); // Set the errors in the state
            }


        }
    }




    // date is the data returned from the server
    const createdAt = formatDate(userDetails?.user?.createdAt);

    const welcome = userDetails?.user?.IsAdmin ? `Welcome, ${userDetails?.user?.name}` : `Welcome, ${userDetails?.user?.name}`;

    const handleToggleView = () => {
        setIsViewingProfile((prev) => !prev);
    }

    const profileContent = (<div className="max-w-md mx-auto mt-40 bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl">
        <div className="md:flex">
            <div className="md:flex-shrink-0">
                <img className="w-auto h-full object-cover md:w-48 rounded-l-xl" src="http://via.placeholder.com/150" alt="User Avatar" />
            </div>
            <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-[#FF5100] font-semibold">Profile</div>
                <h1 className="block mt-1 text-2xl leading-tight font-bold text-gray-900">{userDetails?.user?.name}</h1>
                <p className="mt-2 text-gray-600">Email: {userDetails?.user?.email}</p>
                {/* <p className="mt-2 text-gray-600">User ID: 123456</p> */}
                <p className="mt-2 text-gray-600">Joined: {createdAt}</p>
                <div className="mt-4">
                    <button className="bg-[#FF5100] text-white px-4 py-2 rounded-md hover:bg-[#d82b00] disabled:bg-gray-300 cursor-not-allowed w-32" disabled>Edit Profile</button>
                    {/* <button className="bg-[#FF5100] text-white px-4 py-2 rounded-md hover:bg-red-600 ml-2 w-32">Logout</button> */}
                    <LogoutButton />
                </div>
            </div>
        </div>
    </div>
    );

    const usersListContent = userDetails?.users ? (
        <div className="relative mx-5 overflow-x-auto shadow-md sm:rounded-lg">
            <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900">
                <div>
                    <button id="dropdownActionButton" data-dropdown-toggle="dropdownAction" className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" type="button">
                        <span className="sr-only">Action button</span>
                        Action
                        <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                        </svg>
                    </button>

                </div>
                <label htmlFor="table-search" className="sr-only">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                    <input type="text"
                        id="table-search-users"
                        className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search for users"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="p-4">
                            <div className="flex items-center">
                                <input id="checkbox-all-search" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded accent-[#FF5100] focus:ring-[#FF5100] dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                            </div>
                        </th>
                        <th scope="col" className="px-6 py-3 ">Id</th>
                        <th scope="col" className="px-6 py-3 w-28">Is Admin</th>
                        <th scope="col" className="px-6 py-3 hidden md:table-cell">created</th>
                        <th scope="col" className="px-6 py-3 hidden md:table-cell">updated</th>
                        <th scope="col" className="px-6 py-3">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers?.map((eachUser) => (
                        <tr key={eachUser.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900 transition duration-200">
                            <td className="w-4 p-4">
                                <div className="flex items-center">
                                    <input id={`checkbox-table-search-${eachUser.id}`} type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded accent-[#FF5100] focus:ring-[#FF5100] dark:focus:ring-[#d82b00] dark:accent-[#d82b00] dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                                    <label htmlFor={`checkbox-table-search-${eachUser.id}`} className="sr-only">checkbox</label>
                                </div>
                            </td>
                            <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                <img className="w-10 h-10 rounded-full shadow" src="http://via.placeholder.com/40" alt="User Avatar" />
                                <div className="pl-4">
                                    <div className="text-base font-semibold">{eachUser.name}</div>
                                    <div className="text-sm font-normal text-gray-500">{eachUser.email}</div>
                                </div>
                            </th>
                            {/* // make check box for is admin */}
                            <td className="w-4 p-4">
                                <div className="flex items-center">
                                    <input id={`checkbox-table-search-${eachUser.id}`} type="checkbox" checked={eachUser.IsAdmin} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded accent-[#FF5100] focus:ring-[#FF5100] dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" disabled={eachUser.IsAdmin} />
                                    <label htmlFor={`checkbox-table-search-${eachUser.id}`} className="sr-only">checkbox</label>
                                </div>
                            </td>
                            {/* // dreate good time like 1 Jan 2024  */}
                            <td className="px-6 py-4 hidden md:table-cell">
                                <span className={`inline-flex items-center rounded-full  mr-2 items-center px-2.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800`}>
                                    {formatDate(eachUser.createdAt)}
                                </span>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                                {/* <div className="flex items-center"> */}
                                <span className={`inline-flex items-center rounded-full  mr-2 items-center px-2.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800`}>
                                    {formatDate(eachUser.updatedAt)}
                                </span>
                                {/* </div> */}
                            </td>
                            <td className="px-6 py-4 ">
                                <div className="ld:flex flex-col md:flex-row gap-4 md:gap-2 items-center">
                                    {/* Edit Button */}
                                    <button
                                        onClick={() => openEditModal({
                                            id: eachUser.id,
                                            name: eachUser.name,
                                            email: eachUser.email,
                                            isAdmin: eachUser.isAdmin,
                                        })}
                                        className="inline-flex items-center justify-center p-1.5 rounded-md bg-[#4A90E2] hover:bg-[#357ABD] shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 lg:mb-2 md:mb-2 mb-2 me-2"
                                    >
                                        <PencilSquareIcon className="w-4 h-4 text-white" />
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        // onClick={() => openEditModal(eachUser)}
                                        className="inline-flex items-center justify-center p-1.5 rounded-md bg-[#E74C3C] hover:bg-[#C0392B] shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 md:me-0 lg:ml-2 lg:mb-2 "
                                    >
                                        <UserMinusIcon className="w-4 h-4 text-white" />
                                    </button>
                                </div>


                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : <div>Loading...</div>;

    return (
        <section className="container mx-auto">
            <div className="header-container flex justify-center items-center h-20 text-center flex-col my-5 gap-4">
                <h1 className="text-xl">{welcome}</h1>
                {userDetails?.user.IsAdmin && (
                    <div className="flex gap-4">
                        <button
                            onClick={handleToggleView}
                            className="bg-[#FF5100] text-white px-4 py-2 rounded-md hover:bg-red-600 mx-auto block mt-8"
                        >
                            {isViewingProfile ? "View User List" : "View My Profile"}
                        </button>
                    </div>
                )}
            </div>
            {userDetails?.user.IsAdmin ? (
                isViewingProfile ? (
                    // Admin Profile View
                    <ProfileCard
                        name={userDetails?.user?.name || ""}
                        email={userDetails?.user?.email || ""}
                        createdAt={createdAt}
                    />
                ) : (
                    <>
                        {usersListContent}
                    </>
                )
            ) : (
                // Normal User Profile View
                <ProfileCard
                    name={userDetails?.user?.name || ""}
                    email={userDetails?.user?.email || ""}
                    createdAt={createdAt}
                    isEditable={true} // Allow edit button for normal users
                />
            )}
            {isEditModalOpen && (
                <EditUserModal
                    editedUser={editedUser}
                    setEditedUser={setEditedUser}
                    onClose={closeEditModal}
                    onSubmit={handleEditSubmit}
                    formErrors={formErrors}
                />
            )}

            {notification.isVisible && (
                <Notification {...notification} onClose={() => setNotification({ ...notification, isVisible: false })} />

            )}
        </section>
    );
};



export default Dashboard;