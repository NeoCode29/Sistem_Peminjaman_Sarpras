import { prisma } from "@/lib/prisma";

/**
 * Get all application settings
 * Used by: Admin settings page, system initialization
 * Purpose: Retrieve all configuration settings from database
 * 
 * @returns Promise<Pengaturan[]> - Array of all settings
 */
export const getSettings = async () => {
  try {
    const settings = await prisma.pengaturan.findMany();
    return settings;
  } catch (error) {
    console.error("Error getting settings:", error);
    throw new Error("Gagal mengambil pengaturan");
  }
};

/**
 * Get specific setting by name
 * Used by: Components that need specific setting values
 * Purpose: Retrieve single setting value by name
 * 
 * @param nama - Setting name to retrieve
 * @returns Promise<Pengaturan | null> - Setting object or null if not found
 */
export const getSettingByName = async (nama: string) => {
  try {
    const setting = await prisma.pengaturan.findUnique({
      where: { nama },
    });
    return setting;
  } catch (error) {
    console.error(`Error getting setting ${nama}:`, error);
    throw new Error(`Gagal mengambil pengaturan ${nama}`);
  }
};

/**
 * Update or create application setting
 * Used by: Admin settings page
 * Purpose: Update existing setting or create new one if doesn't exist
 * 
 * @param nama - Setting name to update/create
 * @param nilai - New setting value
 * @returns Promise<Pengaturan> - Updated/created setting object
 */
export const updateSetting = async (nama: string, nilai: string) => {
  try {
    const setting = await prisma.pengaturan.upsert({
      where: {
        nama,
      },
      update: {
        nilai,
      },
      create: {
        nama,
        nilai,
      },
    });
    return setting;
  } catch (error) {
    console.error("Error updating setting:", error);
    throw new Error("Gagal mengupdate pengaturan");
  }
};

/**
 * Get template settings for documents
 * Used by: PanduanContent and document-related components
 * Purpose: Retrieve template URLs and content settings
 * 
 * @returns Promise<{[key: string]: string}> - Template settings object
 */
export const getTemplateSettings = async () => {
  try {
    const templateSettings = await prisma.pengaturan.findMany({
      where: {
        nama: {
          in: ['template_form_peminjaman', 'template_surat_pengajuan']
        }
      }
    });

    // Convert to object format
    const templates: { [key: string]: string } = {};
    templateSettings.forEach(setting => {
      templates[setting.nama] = setting.nilai;
    });

    return templates;
  } catch (error) {
    console.error("Error getting template settings:", error);
    throw new Error("Gagal mengambil template pengaturan");
  }
};
