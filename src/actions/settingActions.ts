"use server";

import { revalidatePath } from "next/cache";
import * as settingService from "@/service/settingService";
import { Pengaturan } from "@prisma/client";

/**
 * Update minimal hari pengajuan setting
 * Used by: Admin
 * Purpose: Update minimum days required before event for loan submission
 * 
 * @param value - Number of days
 * @returns Promise<{success: boolean, error?: string}> - Update result
 */
export const updateMinimalHariPengajuan = async (value: number) => {
  try {
    await settingService.updateSetting("minimal_hari_pengajuan", value.toString());
    revalidatePath("/admin/settings");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal mengupdate minimal hari pengajuan" };
  }
};

/**
 * Update default punishment days setting
 * Used by: Admin
 * Purpose: Update default number of days for user punishment
 * 
 * @param value - Number of punishment days
 * @returns Promise<{success: boolean, error?: string}> - Update result
 */
export const updateHariHukuman = async (value: number) => {
  try {
    await settingService.updateSetting("hari_hukuman", value.toString());
    revalidatePath("/admin/settings");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal mengupdate hari hukuman" };
  }
};

/**
 * Update URL file form peminjaman setting
 * Used by: Admin
 * Purpose: Update URL for downloadable loan form file
 * 
 * @param value - URL string
 * @returns Promise<{success: boolean, error?: string}> - Update result
 */
export const updateUrlFileFormPeminjaman = async (value: string) => {
  try {
    await settingService.updateSetting("url_file_form_peminjaman", value);
    revalidatePath("/admin/settings");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal mengupdate URL file form peminjaman" };
  }
};

/**
 * Update URL form peminjaman setting
 * Used by: Admin
 * Purpose: Update URL for online loan form
 * 
 * @param value - URL string
 * @returns Promise<{success: boolean, error?: string}> - Update result
 */
export const updateUrlFormPeminjaman = async (value: string) => {
  try {
    await settingService.updateSetting("url_form_peminjaman", value);
    revalidatePath("/admin/settings");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal mengupdate URL form peminjaman" };
  }
};

/**
 * Update admin phone number setting
 * Used by: Admin
 * Purpose: Update admin contact phone number for user notifications
 * 
 * @param value - Phone number string
 * @returns Promise<{success: boolean, error?: string}> - Update result
 */
export const updateNomerHandphoneAdmin = async (value: string) => {
  try {
    await settingService.updateSetting("nomer_handphone_admin", value);
    revalidatePath("/admin/settings");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal mengupdate nomor handphone admin" };
  }
};

/**
 * Get all application settings
 * Used by: Admin, System (for punishment defaults, etc.)
 * Purpose: Retrieve all application configuration settings
 * Workflow: Calls settingService.getSettings -> maps to structured object -> returns formatted response
 * 
 * @returns Promise<{success: boolean, data?: object, error?: string}> - Settings object or error
 */
export const getSettings = async () => {
  try {
    const settings = await settingService.getSettings();
    const settingsMap = settings.reduce((acc: Record<string, string>, setting: Pengaturan) => {
      acc[setting.nama] = setting.nilai;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        minimal_hari_pengajuan: parseInt(settingsMap.minimal_hari_pengajuan || "3"),
        hari_hukuman: parseInt(settingsMap.hari_hukuman || "7"),
        url_file_form_peminjaman: settingsMap.url_file_form_peminjaman || "",
        url_form_peminjaman: settingsMap.url_form_peminjaman || "",
        nomer_handphone_admin: settingsMap.nomer_handphone_admin || "",
      },
    };
  } catch {
    return { success: false, error: "Gagal mengambil pengaturan" };
  }
};

/**
 * Get specific setting value by name
 * Used by: System components that need specific settings
 * Purpose: Retrieve single setting value for specific use cases
 * 
 * @param nama - Setting name to retrieve
 * @returns Promise<{success: boolean, data?: string, error?: string}> - Setting value or error
 */
export const getSettingByName = async (nama: string) => {
  try {
    const setting = await settingService.getSettingByName(nama);
    return {
      success: true,
      data: setting?.nilai || null,
    };
  } catch {
    return { success: false, error: "Gagal mengambil pengaturan" };
  }
};

/**
 * Get punishment default days setting
 * Used by: HukumanDialog, Punishment components
 * Purpose: Get default punishment duration for UI initialization
 * 
 * @returns Promise<{success: boolean, data?: number, error?: string}> - Default punishment days or error
 */
export const getHariHukumanDefault = async () => {
  try {
    const setting = await settingService.getSettingByName("hari_hukuman");
    const defaultDays = setting ? parseInt(setting.nilai) : 7;
    
    return {
      success: true,
      data: defaultDays,
    };
  } catch {
    return { success: false, error: "Gagal mengambil pengaturan hari hukuman", data: 7 };
  }
};

/**
 * Get template settings for documents
 * Used by: PanduanContent, Document management components
 * Purpose: Retrieve template URLs and content for user guidance
 * 
 * @returns Promise<{success: boolean, data?: object, error?: string}> - Template settings or error
 */
export const getTemplateSettings = async () => {
  try {
    const templateSettings = await settingService.getTemplateSettings();
    return {
      success: true,
      data: templateSettings,
    };
  } catch {
    return { success: false, error: "Gagal mengambil template pengaturan" };
  }
};
