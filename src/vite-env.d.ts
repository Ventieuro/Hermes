/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_GOOGLE_CLIENT_ID?: string
	readonly VITE_GOOGLE_DRIVE_FILE_NAME?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
