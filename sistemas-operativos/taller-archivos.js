// taller-archivos.js — Taller «Archivos y permisos» (SO monopuesto, UD3, RA1 CE d, e, f, g).
// Genera una tanda distinta por semilla: sistemas de archivos, permisos rwx y rutas, atributos y journaling.

export function azar(semilla) {
  let s = (semilla >>> 0) || 1;
  const sig = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  return { n: (a, b) => a + Math.floor(sig() * (b - a + 1)), de: l => l[Math.floor(sig() * l.length)], sacar: l => l.splice(Math.floor(sig() * l.length), 1)[0] };
}

export const SISTEMAS = ['FAT32', 'exFAT', 'NTFS', 'ext4', 'APFS', 'ReFS'];
const CLIENTES = [
  r => ({ texto: `Un pendrive de ${r.de([8, 16, 32])} GB para llevar documentos y fotos a ${r.de(['la tele del salón', 'la impresora de la copistería', 'la radio de un coche antiguo'])}, que solo lee formatos muy básicos.`, bien: 'FAT32', porque: 'FAT32 es el que entiende casi cualquier aparato. Su pega es que no admite archivos de 4 GB o más, pero aquí son pequeños.' }),
  r => ({ texto: `Un disco externo para pasar películas de ${r.de([6, 9, 14, 25])} GB entre un PC con Windows y un Mac.`, bien: 'exFAT', porque: 'En FAT32 no cabe un archivo de 4 GB o más. exFAT no tiene ese límite y lo leen y escriben Windows y macOS.' }),
  r => ({ texto: `La tarjeta SD de ${r.de([64, 128, 256])} GB de una cámara que graba vídeos largos en 4K.`, bien: 'exFAT', porque: 'Es el formato de las tarjetas grandes: pensado para memorias flash y sin el límite de 4 GB por archivo.' }),
  () => ({ texto: 'El disco donde se va a instalar Windows 11 en un PC nuevo.', bien: 'NTFS', porque: 'Windows se instala en NTFS: tiene permisos por usuario, registro por diario (journaling) y admite archivos enormes.' }),
  r => ({ texto: `Un disco de datos en un PC con Windows donde la carpeta de ${r.de(['nóminas', 'contabilidad', 'expedientes'])} solo la deben poder abrir dos personas.`, bien: 'NTFS', porque: 'Hacen falta permisos por usuario, y FAT32 y exFAT no los tienen. En Windows, eso es NTFS.' }),
  r => ({ texto: `El disco donde se va a instalar ${r.de(['Ubuntu', 'Linux Mint', 'Debian'])} en un portátil.`, bien: 'ext4', porque: 'ext4 es el sistema de archivos habitual de Linux: con permisos y con registro por diario.' }),
  r => ({ texto: `El SSD interno de un ${r.de(['MacBook', 'iMac'])} nuevo.`, bien: 'APFS', porque: 'APFS es el sistema de archivos de Apple, pensado para discos SSD.' }),
  () => ({ texto: 'Los discos de un servidor con Windows Server que guarda muchísimos datos y máquinas virtuales, donde lo que más importa es que nada se corrompa.', bien: 'ReFS', porque: 'ReFS es el sistema de archivos de Microsoft para servidores: detecta los datos estropeados y, si hay copia en otro disco, los repara solo.' }),
];

const PERMISOS = ['644', '640', '600', '664', '755', '750', '700', '775', '444', '660', '711', '754'];
const NOMBRES = ['informe.odt', 'nominas.ods', 'copia.sh', 'notas.txt', 'fotos.zip', 'arranque.sh'];
export const simbolico = octal => [...octal].map(d => ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'][Number(d)]).join('');
const ACCIONES = [['leer', 4, 'r'], ['modificar', 2, 'w'], ['ejecutar', 1, 'x']];
const QUIENES = [['ana', 0, 'es la propietaria'], ['luis', 1, 'no es el propietario, pero pertenece al grupo ventas'], ['marta', 2, 'no es la propietaria ni está en el grupo: es «otros»']];

const RUTAS = [
  ['C:\\Users\\ana\\Documents\\nota.txt', 'absoluta'], ['Documents\\nota.txt', 'relativa'], ['/home/ana/notas.txt', 'absoluta'], ['../fotos/playa.jpg', 'relativa'],
  ['.\\trabajo.docx', 'relativa'], ['/etc/hosts', 'absoluta'], ['D:\\Copias\\enero.zip', 'absoluta'], ['musica/rock/tema1.mp3', 'relativa'],
];
const ATRIBUTOS = [
  ['El archivo no se ve en el Explorador hasta que marcas «Elementos ocultos».', 'Oculto'],
  ['Puedes abrirlo, pero al guardar cambios encima te avisa de que no puede.', 'Solo lectura'],
  ['Es un archivo importante de Windows: no aparece aunque marques «Elementos ocultos».', 'Sistema'],
  ['Se ha activado solo porque el archivo ha cambiado: el programa de copias sabe que tiene que copiarlo.', 'Archivo'],
];
const DIARIO = [['FAT32', 'no'], ['exFAT', 'no'], ['NTFS', 'si'], ['ext4', 'si']];

export function crearTanda(semilla) {
  const r = azar(semilla), resto = [...CLIENTES];
  const clientes = Array.from({ length: 4 }, () => r.sacar(resto)(r));
  const octal = r.de(PERMISOS), nombre = r.de(NOMBRES), inverso = r.de(PERMISOS.filter(p => p !== octal));
  const preguntas = [];
  const pares = QUIENES.flatMap(q => ACCIONES.map(a => [q, a]));
  while (preguntas.length < 3) { const [q, a] = r.sacar(pares); if (!preguntas.some(p => p.quien === q[0])) preguntas.push({ quien: q[0], por: q[2], accion: a[0], letra: a[2], puede: (Number(octal[q[1]]) & a[1]) > 0, trio: simbolico(octal).slice(q[1] * 3, q[1] * 3 + 3) }); }
  return { semilla, clientes, permisos: { octal, simbolico: simbolico(octal), linea: `-${simbolico(octal)} 1 ana ventas ${r.n(1, 90) * 512} ${nombre}`, nombre, preguntas, inverso }, ruta: r.de(RUTAS), atributo: r.de(ATRIBUTOS), diario: r.de(DIARIO) };
}

const limpio = t => String(t ?? '').trim();
export function corregir(t, resp) {
  const p = t.permisos;
  const lista = [
    ...t.clientes.map((c, i) => ({ id: 'cli' + i, ok: resp['cli' + i] === c.bien, correcta: c.bien, porque: c.porque })),
    { id: 'octal', ok: limpio(resp.octal) === p.octal, correcta: p.octal, porque: `r vale 4, w vale 2 y x vale 1; se suma cada grupo de tres: ${[0, 3, 6].map(i => p.simbolico.slice(i, i + 3) + ' = ' + p.octal[i / 3]).join(', ')}.` },
    ...p.preguntas.map((q, i) => ({ id: 'puede' + i, ok: resp['puede' + i] === (q.puede ? 'si' : 'no'), correcta: q.puede ? 'Sí' : 'No', porque: `${q.quien} ${q.por}, así que le tocan los permisos «${q.trio}»: ${q.puede ? 'tiene' : 'no tiene'} la ${q.letra}.` })),
    { id: 'inverso', ok: limpio(resp.inverso).toLowerCase() === simbolico(p.inverso), correcta: simbolico(p.inverso), porque: `Cada cifra es un grupo de tres letras: ${[...p.inverso].map(d => d + ' = ' + simbolico(d)).join(', ')}.` },
    { id: 'ruta', ok: resp.ruta === t.ruta[1], correcta: t.ruta[1] === 'absoluta' ? 'Absoluta' : 'Relativa', porque: t.ruta[1] === 'absoluta' ? 'Empieza en la raíz (una letra de unidad como C:\\ en Windows, o / en Linux): vale estés donde estés.' : 'No empieza en la raíz: se cuenta desde la carpeta en la que estás.' },
    { id: 'atributo', ok: resp.atributo === t.atributo[1], correcta: t.atributo[1], porque: 'Solo lectura: no deja guardar cambios. Oculto: no se muestra (pero no lo protege). Sistema: archivo importante de Windows, oculto aunque muestres los ocultos. Archivo: se activa solo cuando el archivo cambia y lo usan las copias de seguridad.' },
    { id: 'diario', ok: resp.diario === t.diario[1], correcta: t.diario[1] === 'si' ? 'Sí' : 'No', porque: t.diario[1] === 'si' ? `${t.diario[0]} apunta en un diario lo que va a hacer antes de hacerlo; si se va la luz a medias, al arrancar lo repasa y deja el disco coherente.` : `${t.diario[0]} no lleva diario: si se va la luz mientras escribe, es más fácil que el sistema de archivos quede dañado.` },
  ];
  return { lista, aciertos: lista.filter(x => x.ok).length, total: lista.length };
}
export function solucion(t) {
  const p = t.permisos;
  return { ...Object.fromEntries(t.clientes.map((c, i) => ['cli' + i, c.bien])), octal: p.octal, ...Object.fromEntries(p.preguntas.map((q, i) => ['puede' + i, q.puede ? 'si' : 'no'])), inverso: simbolico(p.inverso), ruta: t.ruta[1], atributo: t.atributo[1], diario: t.diario[1] };
}
