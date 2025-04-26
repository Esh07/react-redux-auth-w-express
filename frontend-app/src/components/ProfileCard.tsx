import React from "react";
import LogoutButton from "./LogoutButton";

interface ProfileCardProps {
    name: string;
    email: string;
    createdAt: string;
    isEditable?: boolean; // Optional prop to control edit button visibility
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, email, createdAt, isEditable = false }) => {
    return (
        <div className="max-w-md mx-auto mt-40 bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl">
            <div className="md:flex">
                <div className="md:flex-shrink-0">
                    <img
                        className="w-auto h-full object-cover md:w-48 rounded-l-xl"
                        src="http://via.placeholder.com/150"
                        alt="User Avatar"
                    />
                </div>
                <div className="p-8">
                    <div className="uppercase tracking-wide text-sm text-[#FF5100] font-semibold">Profile</div>
                    <h1 className="block mt-1 text-2xl leading-tight font-bold text-gray-900">{name}</h1>
                    <p className="mt-2 text-gray-600">Email: {email}</p>
                    <p className="mt-2 text-gray-600">Joined: {createdAt}</p>
                    <div className="mt-4">
                        {isEditable && (
                            <button
                                className="bg-[#FF5100] text-white px-4 py-2 rounded-md hover:bg-[#d82b00] disabled:bg-gray-300 cursor-not-allowed w-32"
                                disabled
                            >
                                Edit Profile
                            </button>
                        )}
                        <LogoutButton />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;