import {env} from 'cloudflare:workers';
export function database(){const db=(env as unknown as {DB:D1Database}).DB;if(!db)throw new Error('数据服务暂不可用');return db;}
