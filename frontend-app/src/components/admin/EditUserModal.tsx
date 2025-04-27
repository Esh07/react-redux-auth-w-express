import React from 'react';
import * as Yup from 'yup';
import { editUserSchema } from '../../schemas/editUserSchema';

interface Props {
    editedUser: any;
    setEditedUser: (user: any) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formErrors: Record<string, string>;
}

const EditUserModal: React.FC<Props> = ({ editedUser, setEditedUser, onClose, onSubmit, formErrors }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg mx-4">
                <h2 className="text-3xl font-bold mb-6 text-center">Edit User</h2>
                <form onSubmit={onSubmit}>
                    {/* Name Input */}
                    <div className="mb-4">
                        <label className="block mb-1">Name</label>
                        <input
                            className="w-full border rounded p-2"
                            value={editedUser.name}
                            onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                        />
                        {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                    </div>

                    {/* Email Input */}
                    <div className="mb-4">
                        <label className="block mb-1">Email</label>
                        <input
                            className="w-full border rounded p-2"
                            value={editedUser.email}
                            onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                        />
                        {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
                    </div>

                    {/* IsAdmin Checkbox */}
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={editedUser.IsAdmin}
                            onChange={(e) => setEditedUser({ ...editedUser, IsAdmin: e.target.checked })}
                        />
                        Is Admin
                    </label>

                    {/* Buttons */}
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
                            Cancel
                        </button>
                        <button type="submit" className="bg-[#FF5100] text-white px-4 py-2 rounded">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
