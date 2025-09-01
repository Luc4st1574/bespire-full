import { Download, FolderOpen, Edit, Trash2, Undo2 } from 'lucide-react';

interface ActionsMenuProps {
    mode: 'files' | 'trash';
    onDownload?: () => void;
    onOpen?: () => void;
    onRename?: () => void;
    onDelete?: () => void;
    onRestore?: () => void;
    onPermanentDelete?: () => void;
}

const fileMenuItems = [
    { label: 'Download', icon: Download, action: 'onDownload' as const, isDestructive: false },
    { label: 'Open', icon: FolderOpen, action: 'onOpen' as const, isDestructive: false },
    { label: 'Rename', icon: Edit, action: 'onRename' as const, isDestructive: false },
    { label: 'Delete', icon: Trash2, action: 'onDelete' as const, isDestructive: true },
];

const trashMenuItems = [
    { label: 'Restore', icon: Undo2, action: 'onRestore' as const, isDestructive: false },
    { label: 'Delete Permanently', icon: Trash2, action: 'onPermanentDelete' as const, isDestructive: true },
];

export default function ActionsMenu({ mode, ...props }: ActionsMenuProps) {
    const actions = props as { [key: string]: (() => void) | undefined };

    // Select and filter menu items based on the mode and provided action functions
    const menuItems = (mode === 'trash' ? trashMenuItems : fileMenuItems)
        .filter(item => !!actions[item.action]);

    return (
        <div className="w-48 origin-top-right rounded-md bg-white shadow-lg border border-gray-300 focus:outline-none">
            <div className="py-1">
                {menuItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={actions[item.action]}
                        className={`group flex w-full items-center px-4 py-2 text-sm ${
                            item.isDestructive
                                ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                        <item.icon
                            className={`mr-3 h-5 w-5 ${
                                item.isDestructive
                                    ? 'text-red-500'
                                    : 'text-gray-400 group-hover:text-gray-500'
                            }`}
                            aria-hidden="true"
                        />
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
}