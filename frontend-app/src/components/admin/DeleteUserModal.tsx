import React from 'react';

const DeleteConfirmationModal: React.FC<{
    isDeleteModalOpen: boolean;
    setIsDeleteModalOpen: (open: boolean) => void;
    handleDelete: () => void;
}> = ({ isDeleteModalOpen, setIsDeleteModalOpen, handleDelete }) => {
    if (!isDeleteModalOpen) return null;  // Don't render the modal if it's not open

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-md mx-4">
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Confirm Deletion</h2>
                <p className="text-center text-gray-600 mb-6">
                    Are you sure you want to delete this user? This action cannot be undone.
                </p>

                <div className="flex justify-between gap-4">
                    {/* Cancel Button */}
                    <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="w-full py-2 rounded-lg border border-gray-300 bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition duration-200"
                    >
                        Cancel
                    </button>

                    {/* Confirm Delete Button */}
                    <button
                        onClick={handleDelete}
                        className="w-full py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition duration-200"
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
