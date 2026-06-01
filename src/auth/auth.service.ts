import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { Prisma } from '@prisma/client';

type UsuarioCompleto =
    Prisma.usuariosGetPayload<{
        include: {
            empresas: true;
            usuarios_roles: {
                include: {
                    roles_usuarios: true;
                };
            };
            sedes: true;
        };
    }>;

@Injectable()
export class AuthService {

    constructor(
        private prisma: PrismaService,
    ) { }

    /**
     * Obtiene el perfil del usuario autenticado.
     *
     * Flujo:
     * 1. Extrae información del usuario desde el token.
     * 2. Busca el usuario en la base de datos.
     * 3. Si no existe, rechaza el acceso.
     *    TODO: eliminar el usuario Auth de Supabase si corresponde.
     * 4. Si existe, actualiza sus datos desde Google.
     * 5. Verifica que el acceso no esté bloqueado.
     * 6. Retorna el perfil completo del usuario.
     */
    async getProfile(authPayload: any) {
        try {
            const { user } = authPayload;

            if (!user) {
                throw new UnauthorizedException('Usuario no encontrado');
            }

            const email = user.email;
            const user_metadata = user.user_metadata;
            const sub = user.id;

            if (!email) {
                throw new UnauthorizedException('El token no contiene email');
            }

            console.log('1️⃣ Usuario extraído desde token:', email);

            // ------------------------------
            // Buscar usuario en la base de datos
            // ------------------------------
            let userDb: UsuarioCompleto | null = await this.prisma.usuarios.findFirst({
                where: {
                    email,
                    estado: true,
                },
                include: {
                    empresas: true,
                    usuarios_roles: {
                        include: {
                            roles_usuarios: true,
                        },
                    },
                    sedes: true,
                },
            });

            // ------------------------------
            // Si no existe, rechazar acceso
            // ------------------------------
            if (!userDb) {
                console.warn('❌ Usuario no registrado en la base de datos:', email);

                /**
                 * TODO:
                 * Aquí se podría eliminar el usuario de Supabase Auth.
                 *
                 * Para hacerlo necesitas usar el cliente admin de Supabase
                 * con la SERVICE_ROLE_KEY, nunca con la anon key.
                 *
                 * Ejemplo conceptual:
                 *
                 * await supabaseAdmin.auth.admin.deleteUser(sub);
                 *
                 * De momento solo rechazamos el acceso.
                 */

                throw new UnauthorizedException(
                    'Usuario no registrado en el sistema. Contacta al administrador.'
                );
            }

            console.log('2️⃣ Usuario encontrado en BD:', userDb.id_usuario);

            // ------------------------------
            // Si existe, actualizar datos desde Google
            // ------------------------------
            const updateData: any = {};
            let hasChanges = false;

            if (user_metadata?.full_name) {
                const fullName = user_metadata.full_name;
                const [firstName, ...lastNameParts] = fullName.split(' ');
                const lastName = lastNameParts.join(' ');

                if (userDb.nombres !== firstName) {
                    updateData.nombres = firstName;
                    hasChanges = true;
                }

                if (userDb.apellidos !== lastName) {
                    updateData.apellidos = lastName;
                    hasChanges = true;
                }
            }

            if (user_metadata?.avatar_url && userDb.avatar_url !== user_metadata.avatar_url) {
                updateData.avatar_url = user_metadata.avatar_url;
                hasChanges = true;
            }

            if (user_metadata?.phone && userDb.telefono !== user_metadata.phone) {
                updateData.telefono = user_metadata.phone;
                hasChanges = true;
            }

            if (sub && userDb.google_uid !== sub) {
                updateData.google_uid = sub;
                hasChanges = true;
            }

            if (hasChanges) {
                userDb = await this.prisma.usuarios.update({
                    where: {
                        id_usuario: userDb.id_usuario,
                    },
                    data: updateData,
                    include: {
                        empresas: true,
                        usuarios_roles: {
                            include: {
                                roles_usuarios: true,
                            },
                        },
                        sedes: true,
                    },
                });

                console.log('✅ Usuario actualizado desde Google');
            }

            // ------------------------------
            // Verificar estado del usuario
            // ------------------------------
            if (!userDb.estado) {
                throw new UnauthorizedException(
                    'Usuario inactivo. Contacta al administrador.'
                );
            }

            if (userDb.estado_acceso === 'bloqueado') {
                throw new UnauthorizedException(
                    'Acceso denegado. Por favor, contacta al administrador.'
                );
            }

            const rol = userDb.usuarios_roles?.[0]?.roles_usuarios;

            return {
                id: Number(userDb.id_usuario),
                id_empresa: Number(userDb.id_empresa),

                empresa: userDb.empresas ? {
                    id: Number(userDb.empresas.id_empresa),
                    razon_social: userDb.empresas.razon_social,
                    nombre_comercial: userDb.empresas.nombre_comercial,
                    ruc: userDb.empresas.ruc,
                } : null,

                email: userDb.email,
                google_uid: userDb.google_uid,
                nombres: userDb.nombres,
                apellidos: userDb.apellidos,
                telefono: userDb.telefono,
                avatar_url: userDb.avatar_url,
                estado_acceso: userDb.estado_acceso,
                estado: userDb.estado,
                created_at: userDb.created_at,

                rol: rol ? {
                    id: Number(rol.id_rol_usuario),
                    nombre: rol.nombre,
                    descripcion: rol.descripcion,
                } : null,

                sede: userDb.sedes ? {
                    id: Number(userDb.sedes.id_sede),
                    nombre: userDb.sedes.nombre,
                    tipo_sede: userDb.sedes.tipo_sede,
                    ciudad: userDb.sedes.ciudad,
                    departamento: userDb.sedes.departamento,
                } : null,
            };

        } catch (error) {
            console.error('❌ Error en getProfile:', error);
            throw error;
        }
    }
}