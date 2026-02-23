import { http } from './http.api';
import type { ILoginPayload, IRegisterPayload } from '../interfaces/auth.interface'

export async function apiLogin(payload: ILoginPayload) {
  const res = await http.post('/user/login', payload);
  return res.data;
}

export async function apiRegister(payload: IRegisterPayload) {
  const res = await http.post('/user/register', payload);
  return res.data;
}

export async function apiMe() {
  const res = await http.get('/user/me');
  return res.data;
}