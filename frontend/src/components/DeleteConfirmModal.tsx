'use client';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  itemName: string;
  itemType: string;
}

export default function DeleteConfirmModal({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  isDeleting, 
  itemName, 
  itemType 
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="material-surface rounded-3xl p-8 w-full max-w-md mx-4 shadow-xl border border-white/20">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Delete {itemType}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete &ldquo;<span className="font-medium text-gray-700">{itemName}</span>&rdquo;? 
          This action cannot be undone.
        </p>
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="material-button-ghost px-6 py-3 rounded-2xl font-medium transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
