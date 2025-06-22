"use client"

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GoogleSignInButton } from './GoogleSignInButton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const CardLogin: React.FC = () => {
  return (
    <Card className="w-full bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="text-center p-8 pb-4">
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20 p-3 bg-blue-50 rounded-2xl">
            <Image
              src="/logo-poliwangi.png"
              alt="Logo Politeknik Negeri Banyuwangi"
              fill
              style={{ objectFit: 'contain' }}
              priority
              className="rounded-xl"
            />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Selamat Datang
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Masuk ke Sistem Informasi
        </p>
        <p className="text-blue-600 font-medium">
          Sarana & Prasarana
        </p>
      </CardHeader>
      
      <CardContent className="p-8 pt-4">
        <div className="space-y-6">
          <GoogleSignInButton className="w-full" />
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Dengan masuk, Anda menyetujui{' '}
              <Link href="#" className="text-blue-600 hover:text-blue-700 underline">
                Syarat & Ketentuan
              </Link>{' '}
              dan{' '}
              <Link href="#" className="text-blue-600 hover:text-blue-700 underline">
                Kebijakan Privasi
              </Link>
            </p>
          </div>
        </div>
      </CardContent>
      
      <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
        <p className="text-sm text-gray-600">
          © 2024 Politeknik Negeri Banyuwangi
        </p>
      </div>
    </Card>
  );
};

export default CardLogin;
