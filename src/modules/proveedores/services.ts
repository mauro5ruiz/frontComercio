import api from "@/plugins/axios";
import type {
  Proveedor,
  CrearProveedorDTO,
  ActualizarProveedorDTO
} from "./types";

const appendIfPresent = (formData: FormData, key: string, value: string | undefined | null) => {
  if (value !== undefined && value !== null && value !== "") {
    formData.append(key, value);
  }
};

const buildFormData = (proveedor: CrearProveedorDTO | ActualizarProveedorDTO) => {
  const formData = new FormData();

  // Campos requeridos
  formData.append("RazonSocial", proveedor.razonSocial ?? "");
  formData.append("Cuit", proveedor.cuit ?? "");
  formData.append("Activo", String(proveedor.activo ?? true));

  // Campos opcionales (solo se envían si tienen valor)
  appendIfPresent(formData, "CondicionIva", proveedor.condicionIva);
  appendIfPresent(formData, "Telefono", proveedor.telefono);
  appendIfPresent(formData, "Email", proveedor.email);
  appendIfPresent(formData, "PersonaContacto", proveedor.personaContacto);
  appendIfPresent(formData, "Direccion", proveedor.direccion);
  appendIfPresent(formData, "Localidad", proveedor.localidad);
  appendIfPresent(formData, "Provincia", proveedor.provincia);
  appendIfPresent(formData, "CodigoPostal", proveedor.codigoPostal);
  appendIfPresent(formData, "Observaciones", proveedor.observaciones);

  if (proveedor.imagen) {
    formData.append("Imagen", proveedor.imagen);
  }

  if ("eliminarImagen" in proveedor && proveedor.eliminarImagen) {
    formData.append("EliminarImagen", "true");
  }

  return formData;
};

//
// GET todos
//
export const obtenerProveedores = async (incluirEliminados = false): Promise<Proveedor[]> => {
  const { data } = await api.get("/proveedores", {
    params: { incluirEliminados }
  });
  return data;
};

//
// GET por id
//
export const obtenerProveedorPorId = async (id: number): Promise<Proveedor> => {
  const { data } = await api.get(`/proveedores/${id}`);
  return data;
};

//
// POST
//
export const crearProveedor = async (proveedor: CrearProveedorDTO): Promise<Proveedor> => {
  const { data } = await api.post("/proveedores", buildFormData(proveedor));
  return data;
};

//
// PATCH actualizar
//
export const actualizarProveedor = async (id: number, proveedor: ActualizarProveedorDTO): Promise<Proveedor> => {
  const { data } = await api.patch(`/proveedores/${id}`, buildFormData(proveedor));
  return data;
};

//
// DELETE permanente
//
export const eliminarProveedor = async (id: number) => {
  await api.delete(`/proveedores/${id}`);
};

//
// PATCH desactivar (soft delete)
//
export const desactivarProveedor = async (id: number) => {
  await api.patch(`/proveedores/${id}/desactivar`);
};

//
// PATCH activar (restaurar)
//
export const activarProveedor = async (id: number) => {
  await api.patch(`/proveedores/${id}/activar`);
};