import api from "@/plugins/axios";
import type {
  Cliente,
  CrearClienteDTO,
  ActualizarClienteDTO
} from "./types";

const appendIfPresent = (formData: FormData,key: string,value: string | undefined | null) => {
  if (value !== undefined && value !== null && value !== "") {
    formData.append(key, value);
  }
};

const buildFormData = (cliente: CrearClienteDTO | ActualizarClienteDTO) => {
  const formData = new FormData();

  // 🔥 requeridos
  if (cliente.tipoCliente !== undefined) {
    formData.append("TipoCliente", String(cliente.tipoCliente));
  }

  formData.append("Activo", String(cliente.activo ?? true));

  // 🔥 datos principales
  appendIfPresent(formData, "Nombre", cliente.nombre);
  appendIfPresent(formData, "Apellido", cliente.apellido);
  appendIfPresent(formData, "RazonSocial", cliente.razonSocial);

  appendIfPresent(formData, "NroDocumento", cliente.nroDocumento);
  appendIfPresent(formData, "Cuit", cliente.cuit);
  appendIfPresent(formData, "NroTelefono", cliente.nroTelefono);
  appendIfPresent(formData, "Email", cliente.email);

  // 🔥 dirección
  appendIfPresent(formData, "Direccion", cliente.direccion);
  appendIfPresent(formData, "Localidad", cliente.localidad);
  appendIfPresent(formData, "Provincia", cliente.provincia);
  appendIfPresent(formData, "CodigoPostal", cliente.codigoPostal);

  appendIfPresent(formData, "CondicionIva", cliente.condicionIva);
  appendIfPresent(formData, "Observaciones", cliente.observaciones);

  // 🔥 imagen
  if (cliente.imagen) {
    formData.append("Imagen", cliente.imagen);
  }

  if ("eliminarImagen" in cliente && cliente.eliminarImagen) {
    formData.append("EliminarImagen", "true");
  }

  return formData;
};

// GET todos
export const obtenerClientes = async (incluirEliminados = false): Promise<Cliente[]> => {
  const { data } = await api.get("/clientes", {
    params: { incluirEliminados }
  });
  return data;
};

// GET por id
export const obtenerClientePorId = async (id: number): Promise<Cliente> => {
  const { data } = await api.get(`/clientes/${id}`);
  return data;
};

// POST
export const crearCliente = async (cliente: CrearClienteDTO): Promise<number> => {
  const { data } = await api.post("/clientes", buildFormData(cliente));
  return data; // 👈 tu backend devuelve el ID
};

// PATCH actualizar
export const actualizarCliente = async (id: number,cliente: ActualizarClienteDTO): Promise<void> => {
  await api.patch(`/clientes/${id}`, buildFormData(cliente));
};

// DELETE permanente
export const eliminarCliente = async (id: number) => {
  await api.delete(`/clientes/${id}`);
};

// PATCH baja (soft delete)
export const darDeBajaCliente = async (id: number) => {
  await api.patch(`/clientes/${id}/baja`);
};

// PATCH restaurar
export const restaurarCliente = async (id: number) => {
  await api.patch(`/clientes/${id}/restauracion`);
};