import api from "@/plugins/axios";
import type {
  ActualizarUsuarioDto,
  CambiarClaveDto,
  CrearUsuarioDto,
  LoginDto,
  UsuarioDto
} from "./types";

export const obtenerUsuarios = async (incluirEliminados = false): Promise<UsuarioDto[]> => {
  const { data } = await api.get<UsuarioDto[]>("/usuarios", {
    params: { incluirEliminados }
  });
  return data;
};

export const obtenerUsuarioPorId = async (id: number): Promise<UsuarioDto> => {
  const { data } = await api.get<UsuarioDto>(`/usuarios/${id}`);
  return data;
};

export const crearUsuario = async (dto: CrearUsuarioDto) => {
  const { data } = await api.post("/usuarios", dto);
  return data;
};

export const actualizarUsuario = async (id: number, dto: ActualizarUsuarioDto) => {
  await api.put(`/usuarios/${id}`, dto);
};

export const activarUsuario = async (id: number) => {
  await api.put(`/usuarios/activacion/${id}`);
};

export const desactivarUsuario = async (id: number) => {
  await api.put(`/usuarios/desactivacion/${id}`);
};

export const cambiarClaveUsuario = async (dto: CambiarClaveDto) => {
  await api.put("/usuarios/cambio-clave", dto);
};

export const loginUsuario = async (dto: LoginDto): Promise<UsuarioDto> => {
  const { data } = await api.post<UsuarioDto>("/usuarios/login", dto);
  return data;
};
