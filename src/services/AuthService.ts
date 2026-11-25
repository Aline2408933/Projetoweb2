import { AppDataSource} from '../data-source.js';
import { Users } from '../entity/Users.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export class AuthService {
    private userRepository = AppDataSource.getRepository(Users);

   async login(email: string, password: string): Promise<{id: number, nameUsers: string, email: string, token: string}> {
       const user = await this.userRepository.findOne({ where: {email}});
       if (!user) {
           throw new Error("Usuário ou senha inválidos");
       }
       const isPasswordValid = await user.comparePassword(password);
       if (!isPasswordValid) {
           throw new Error("Usuário ou senha inválidos");
       }
       // Aqui você pode gerar um token de autenticação, por exemplo, usando JWT
       const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: "7d" }); // Substitua por uma lógica real de geração de token
       return { id: user.id, nameUsers: user.nameUsers, email: user.email, token };
   }
}