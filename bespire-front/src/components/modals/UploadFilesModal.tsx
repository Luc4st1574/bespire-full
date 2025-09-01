import { Fragment, useState, useCallback } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { UploadCloud, X, File, Info, Minus, Check } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { UploadingFile } from './UploadingFilesModal';
import { getFileIcon } from '@/utils/getFileIcon';

interface SupportedFormatsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

function SupportedFormatsModal({ isOpen, onClose }: SupportedFormatsModalProps) {
    const formatCategories = [
        {
            title: "Images",
            formats: ["JPG", "JPEG", "PNG", "GIF", "SVG", "BMP", "WEBP", "TIFF"]
        },
        {
            title: "Documents",
            formats: ["PDF", "DOC", "DOCX", "PPT", "PPTX", "XLS", "XLSX", "TXT", "RTF", "ODT"]
        },
        {
            title: "Videos",
            formats: ["MP4", "MOV", "AVI", "WMV", "FLV", "MKV", "WEBM"]
        },
        {
            title: "Design Files",
            formats: ["PSD (Photoshop)", "AI (Illustrator)", "INDD (InDesign)", "FIG (Figma)", "SKETCH"]
        }
    ];

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/30" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                                    <Info className="text-[#697D67]" size={20}/>
                                    Supported File Formats
                                </DialogTitle>
                                <div className="mt-4 space-y-3 max-h-80 overflow-auto pr-2">
                                    {formatCategories.map(category => (
                                        <div key={category.title}>
                                            <h4 className="font-semibold text-gray-700">{category.title}</h4>
                                            <div className="mt-1 flex flex-wrap gap-2">
                                                {category.formats.map(format => (
                                                    <span key={format} className="px-2 py-0.5 text-sm bg-gray-100 text-gray-800 rounded-md">
                                                        {format}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-[#697D67] px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 focus:outline-none"
                                        onClick={onClose}
                                    >
                                        Got it!
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

interface UploadFilesModalProps {
    open: boolean;
    onClose: () => void;
    onUpload: (files: File[]) => void;
    onMinimize: () => void;
    uploadingFiles: UploadingFile[];
    uploadHasStarted: boolean;
    onRemoveFile: (index: number) => void;
}

export function UploadFilesModal({ open, onClose, onUpload, onMinimize, uploadingFiles, uploadHasStarted, onRemoveFile }: UploadFilesModalProps) {
    const [isFormatsModalOpen, setFormatsModalOpen] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true
    });
    
    const allUploadsDone = uploadHasStarted && uploadingFiles.length > 0 && uploadingFiles.every(f => f.done || f.error);

    return (
        <>
        <Transition show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
            <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                <div className="fixed inset-0 bg-gray-900/30" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                    <DialogPanel className="w-full max-w-xl p-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl flex flex-col relative">

                    <div className="absolute top-4 right-4 z-10">
                        {uploadHasStarted && !allUploadsDone ? (
                        <button type="button" onClick={onMinimize} title="Minimize" className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                            <Minus size={32} />
                        </button>
                        ) : (
                        <button type="button" onClick={onClose} title="Close" className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                            <X size={32} />
                        </button>
                        )}
                    </div>

                    <div className="mb-6">
                        <DialogTitle as="h3" className="text-3xl font-light text-gray-900">
                        Upload Files
                        </DialogTitle>
                    </div>

                    <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-10 transition-colors bg-[#FBFFF7] ${isDragActive ? 'border-[#697D67]' : 'border-gray-300'}`}>
                        <input {...getInputProps()} id="dropzone-file-input"/>
                        <div className="flex items-center justify-center gap-6">
                        <div className="relative flex-shrink-0 w-20 h-20">
                            <File size={80} className="absolute top-0 left-0 text-gray-300" strokeWidth={1} />
                            <div className="absolute -bottom-1 -right-1 w-12 h-12 rounded-full bg-[#697D67] flex items-center justify-center border-4 border-white">
                            <UploadCloud className="text-white" size={26} strokeWidth={2} />
                            </div>
                        </div>
                        <div className="text-left">
                            <p className="text-xl font-medium text-gray-800">Drag & Drop Files</p>
                            <p className="text-md text-gray-500">
                            or <span onClick={openFileDialog} className="font-semibold text-black underline cursor-pointer hover:text-[#697D67]">Browse Files</span>
                            </p>
                        </div>
                        </div>
                    </div>

                    <div className="mt-4 text-center text-sm text-gray-600 whitespace-nowrap">
                        Upload your JPG, PNG, PDF, MP4, DOCX, PPTX files. See
                        <button type="button" onClick={() => setFormatsModalOpen(true)} className="ml-1 text-black font-medium underline hover:text-[#697D67]">
                        (supported formats)
                        </button>
                    </div>

                    {uploadHasStarted && (
                        <>
                        <div className="w-full flex justify-center my-6">
                            <div className="w-11/12 border-t border-gray-200" />
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-800 mb-3">Uploading...</h4>
                            <ul className="space-y-4 max-h-[160px] overflow-auto pr-2">
                                {uploadingFiles.map((f, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                    <Image src={getFileIcon(f.file.name)} width={40} height={40} className="w-10 h-10 flex-shrink-0" alt="file icon" />
                                    <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-800 truncate block pr-2">{f.file.name}</span>
                                        <span className="text-xs text-gray-500">{f.progress || 0}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                                        {f.done ? (
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#697d67]">
                                            <Check className="w-3.5 h-3.5 text-white" />
                                            </div>
                                        ) : (
                                            <FontAwesomeIcon icon={faSpinner} className="fa-spin w-4 h-4 text-gray-400" />
                                        )}
                                        </div>
                                        <div className="h-2 flex-1 rounded bg-gray-200 overflow-hidden">
                                        <div className="h-2 rounded bg-[#869d84] transition-all" style={{ width: `${f.progress || 0}%` }} />
                                        </div>
                                        <button type="button" onClick={() => onRemoveFile(idx)} className="text-gray-400 hover:text-red-600 flex-shrink-0 ml-1" title="Remove" disabled={f.done}>
                                        <X size={16} />
                                        </button>
                                    </div>
                                    </div>
                                </li>
                                ))}
                            </ul>
                        </div>
                        </>
                    )}

                    {/* --- ELEMENT 5: BUTTONS --- */}
                    <div className="mt-8 flex w-full justify-center gap-4">
                        <button
                        type="button"
                        className="w-full justify-center px-10 py-3 text-sm font-medium text-[#697D67] bg-white border border-[#697D67] rounded-full hover:bg-gray-50 focus:outline-none transition-colors"
                        onClick={onClose}
                        >
                        { allUploadsDone ? "Close" : "Cancel" }
                        </button>
                        <button
                        type="button"
                        className="w-full justify-center px-12 py-3 text-sm font-medium text-white bg-[#E0E0E0] rounded-full focus:outline-none transition-colors disabled:hover:bg-[#E0E0E0] enabled:bg-[#697D67] enabled:hover:bg-opacity-90"
                        onClick={onClose}
                        disabled={!allUploadsDone}
                        >
                        Finish
                        </button>
                    </div>

                    </DialogPanel>
                </TransitionChild>
                </div>
            </div>
            </Dialog>
        </Transition>

        <SupportedFormatsModal isOpen={isFormatsModalOpen} onClose={() => setFormatsModalOpen(false)} />
        </>
    );
}