import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  Cliente,
  CrearClienteDTO,
  ActualizarClienteDTO,
  ClienteCuentaCorriente,
  CobrarCuentaCorrienteClienteDTO
} from "./types";
import {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  darDeBajaCliente,
  restaurarCliente,
  obtenerCuentaCorrienteCliente,
  cobrarCuentaCorrienteCliente
} from "./services";
import { useNotificationStore } from "@/stores/notificaciones";

const getApiMessage = (err: any, fallback: string) =>
  err.response?.data?.error ||
  err.response?.data?.Error ||
  err.response?.data?.mensaje ||
  err.response?.data?.Mensaje ||
  fallback;

export const useClientesStore = defineStore("clientes", () => {
  const clientes = ref<Cliente[]>([]);
  const cuentaCorriente = ref<ClienteCuentaCorriente | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const notification = useNotificationStore();

  // GET
  const fetchClientes = async (incluirEliminados = false) => {
    loading.value = true;
    try {
      clientes.value = await obtenerClientes(incluirEliminados);
    } finally {
      loading.value = false;
    }
  };

  const fetchCuentaCorriente = async (
    idCliente: number,
    desde?: string,
    hasta?: string,
    soloPendientes?: boolean
  ) => {
    loading.value = true;
    try {
      error.value = null;
      cuentaCorriente.value = await obtenerCuentaCorrienteCliente(idCliente, {
        desde,
        hasta,
        soloPendientes,
      });
      return cuentaCorriente.value;
    } catch (err: any) {
      const message = getApiMessage(err, "No se pudo obtener la cuenta corriente del cliente");
      error.value = message;
      notification.show(message, "error");
      return null;
    } finally {
      loading.value = false;
    }
  };

  // CREATE
  const addCliente = async (cliente: CrearClienteDTO) => {
    try {
      error.value = null;

      const id = await crearCliente(cliente);

      // 🔥 como el backend devuelve solo ID → lo volvemos a pedir
      const nuevo = await obtenerClientePorId(id);

      clientes.value.push(nuevo);

      notification.show("Cliente creado con éxito", "success");
      return true;
    } catch (err: any) {
      notification.show(
        err.response?.data?.error || "Error al crear el cliente",
        "error"
      );
      return false;
    }
  };

  // UPDATE
  const editCliente = async (id: number,cliente: ActualizarClienteDTO) => {
    try {
      error.value = null;

      await actualizarCliente(id, cliente);

      // 🔥 volvemos a pedir el actualizado
      const actualizado = await obtenerClientePorId(id);

      const index = clientes.value.findIndex(c => c.id === id);
      if (index !== -1) {
        clientes.value[index] = actualizado;
      }

      notification.show("Cliente actualizado con éxito", "success");
      return true;
    } catch (err: any) {
      notification.show(
        err.response?.data?.error || "Error al actualizar el cliente",
        "error"
      );
      return false;
    }
  };

  // DELETE (permanente)
  const removeCliente = async (id: number) => {
    try {
      error.value = null;

      await eliminarCliente(id);
      clientes.value = clientes.value.filter(c => c.id !== id);

      notification.show("Cliente eliminado con éxito", "success");
      return true;
    } catch (err: any) {
      notification.show(
        err.response?.data?.error || "No se puede eliminar el cliente",
        "error"
      );
      return false;
    }
  };

  // SOFT DELETE (baja)
  const darDeBaja = async (id: number) => {
    try {
      error.value = null;

      await darDeBajaCliente(id);

      const cliente = clientes.value.find(c => c.id === id);
      if (cliente) {
        cliente.activo = false;
      }

      notification.show("Cliente dado de baja", "success");
      return true;
    } catch (err: any) {
      notification.show(
        err.response?.data?.error || "Error al dar de baja",
        "error"
      );
      return false;
    }
  };

  // RESTORE
  const restaurar = async (id: number) => {
    try {
      error.value = null;

      await restaurarCliente(id);

      const cliente = clientes.value.find(c => c.id === id);
      if (cliente) {
        cliente.activo = true;
      }

      notification.show("Cliente restaurado", "success");
      return true;
    } catch (err: any) {
      notification.show(
        err.response?.data?.error || "Error al restaurar",
        "error"
      );
      return false;
    }
  };

  const registrarCobroCliente = async (dto: CobrarCuentaCorrienteClienteDTO) => {
    try {
      error.value = null;
      const resp = await cobrarCuentaCorrienteCliente(dto);
      notification.show(resp.mensaje || "Cobro registrado correctamente", "success");
      return true;
    } catch (err: any) {
      const message = getApiMessage(err, "Error al registrar el cobro");
      error.value = message;
      notification.show(message, "error");
      return false;
    }
  };

  return {
    clientes,
    cuentaCorriente,
    loading,
    error,
    fetchClientes,
    fetchCuentaCorriente,
    addCliente,
    editCliente,
    removeCliente,
    darDeBaja,
    restaurar,
    registrarCobroCliente
  };
});
