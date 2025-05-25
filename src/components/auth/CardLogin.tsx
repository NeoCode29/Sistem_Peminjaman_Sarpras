'use client'

import React from 'react';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';
import { signInWithGoogle } from '@/service/authService';

const CardLogin: React.FC = () => {
  return (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center border border-gray-300">
            <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24">
                <Image
                    src="/logo-poliwangi.png"
                    alt="Logo Sarpras"
                    fill
                    style={{ objectFit: 'contain' }}
                    priority
                />
                </div>
            </div>
        
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Selamat Datang di Sarpras</h1>
            <p className="text-gray-600 mb-8">
                Sistem Manajemen Peminjaman<br />
                Sarana &amp; Prasarana
            </p>
        
            <button
                className="flex items-center justify-center w-full py-3 px-4 border border-gray-400 rounded-md shadow-sm bg-white hover:bg-gray-50 transition-colors"
                onClick={() => signInWithGoogle()}
            >
                <FcGoogle className="w-5 h-5 mr-2" />
                <span>Melanjutkan dengan Google</span>
            </button>
        </div>
  );
};

export default CardLogin;
