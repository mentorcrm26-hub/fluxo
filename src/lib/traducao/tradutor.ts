/**
 * Tradutor especializado em Ordens de Serviço, Construção, Reforma e Manutenção Predial (EN -> PT-BR)
 */

// Mapeamento de termos e frases compostas frequentes (ordem decrescente de tamanho para substituição precisa)
const DICIONARIO_FRASES: [RegExp, string][] = [
  // Cabeçalhos e Categorias
  [/Whole Home Services and Mechanical Systems/gi, 'Serviços Gerais da Casa e Sistemas Mecânicos'],
  [/Lighting and electrical system/gi, 'Iluminação e Sistema Elétrico'],
  [/Walls, ceiling and trim/gi, 'Paredes, Teto e Acabamentos'],
  [/Patio\/rear entrance/gi, 'Pátio / Entrada Traseira'],
  [/Front Entryway/gi, 'Hall de Entrada'],
  [/Primary Bathroom/gi, 'Banheiro Suíte / Principal'],
  [/Master Bathroom/gi, 'Banheiro Suíte / Principal'],
  [/Primary Bedroom/gi, 'Quarto Suíte / Principal'],
  [/Master Bedroom/gi, 'Quarto Suíte / Principal'],
  [/Bathroom One/gi, 'Banheiro 1'],
  [/Bathroom Two/gi, 'Banheiro 2'],
  [/Bedroom One/gi, 'Quarto 1'],
  [/Bedroom Two/gi, 'Quarto 2'],
  [/Bedroom Three/gi, 'Quarto 3'],
  [/Laundry Room/gi, 'Lavanderia'],
  [/Living Room/gi, 'Sala de Estar'],
  [/Dining Room/gi, 'Sala de Jantar'],
  [/Front Exterior/gi, 'Área Externa Frontal'],
  [/Rear Exterior/gi, 'Área Externa Traseira'],

  // Descrições de Serviços e Problemas Específicos
  [/bleach clean entryway surface including soffits, entryway and garage area/gi, 'limpar com água sanitária na entrada incluindo beirais, entrada e área da garagem'],
  [/bleach clean entryway surface including soffits\. entryway and garage area/gi, 'limpar com água sanitária na entrada incluindo beirais, entrada e área da garagem'],
  [/Power wash walkway/gi, 'Lavagem de alta pressão na calçada'],
  [/Power wash surface/gi, 'Lavagem de alta pressão na superfície'],
  [/power wash rear entryway\. including windows\.and soffits/gi, 'lavagem de alta pressão na entrada traseira, incluindo janelas e beirais'],
  [/trim a tree \| trim tree and remove trimmings from home/gi, 'podar árvore | podar árvore e recolher podas/galhos da residência'],
  [/trim tree and remove trimmings from home/gi, 'podar árvore e remover galhos da casa'],
  [/spray to match (\d+) walls\. (\d+)window sills\.(\d+) step sills\. (\d+) doors and frames/gi, 'aplicar tinta para combinar com $1 paredes, $2 peitoris de janela, $3 soleiras, $4 portas e batentes'],
  [/Paint Wall to Wall/gi, 'Pintar de parede a parede'],
  [/Paint Trim\/Base\/Doors \(Specify\)/gi, 'Pintar rodapés, guarnições e portas (especificar)'],
  [/Paint frame/gi, 'Pintar batente/moldura'],
  [/Filter replacement needed/gi, 'Troca de filtro necessária'],
  [/Replace HVAC Filter/gi, 'Trocar filtro de ar-condicionado (HVAC)'],
  [/install (\d+) pack of ([^|]+) filter/gi, 'instalar pacote de $1 filtros tamanho $2'],
  [/kitz dried spots on ceiling/gi, 'tratar manchas secas no teto com primer/selador'],
  [/Door does not open\/close smoothly/gi, 'Porta não abre/fecha suavemente'],
  [/adjust door hinge from hitting shower glass door behind it/gi, 'ajustar dobradiça da porta para não bater no box de vidro atrás dela'],
  [/adjust door hinge\. door hitting wall when opened/gi, 'ajustar dobradiça da porta. Porta batendo na parede ao abrir'],
  [/Grout worn\/discolored/gi, 'Rejunte desgastado ou descolorido'],
  [/Caulk wet area/gi, 'Calafetar área molhada'],
  [/caulk shower edges/gi, 'calafetar bordas do chuveiro/box'],
  [/Holes\/penetrations/gi, 'Furos e perfurações'],
  [/Cosmetic issue - no vendor action/gi, 'Questão estética'],
  [/Cosmetic issue/gi, 'Questão estética'],
  [/patch hole in closet/gi, 'tapar/remendar buraco no armário'],
  [/patch (\d+) small holes in closet wall/gi, 'tapar $1 pequenos furos na parede do armário'],
  [/Door off hinges/gi, 'Porta fora das dobradiças'],
  [/adjust hinge from hitting wall\. door must not touch wall when opened/gi, 'ajustar dobradiça para não bater na parede. A porta não deve encostar na parede ao abrir'],
  [/Replace shower handle/gi, 'Trocar manopla/registro do chuveiro'],
  [/tighten shower handle/gi, 'apertar registro/manopla do chuveiro'],
  [/Install shelf pins/gi, 'Instalar pinos de prateleira'],
  [/install missing corner support\. match other end of shelving/gi, 'instalar suporte de canto ausente para alinhar com o outro lado da prateleira'],
  [/Not set in wall/gi, 'Não fixado na parede'],
  [/remove left over white surge protector from ceiling/gi, 'remover filtro de linha/protetor branco pendente no teto'],
  [/Wrong color\/style\/wattage/gi, 'Cor, modelo ou potência incorreta'],
  [/Replace bulb/gi, 'Trocar lâmpada'],
  [/replace (\d+) bulbs to yellow matching home/gi, 'trocar $1 lâmpadas para luz amarela combinando com a casa'],

  // Termos Comuns de Manutenção e Obra
  [/Repainting/gi, 'Repintura'],
  [/Painting/gi, 'Pintura'],
  [/Landscaping/gi, 'Paisagismo / Jardim'],
  [/Service needed/gi, 'Serviço necessário'],
  [/Overgrown/gi, 'Mato alto / Crescido'],
  [/Debris/gi, 'Entulho / Resíduos'],
  [/Dirty/gi, 'Sujo'],
  [/Shower/gi, 'Chuveiro / Box'],
  [/Doors/gi, 'Portas'],
  [/Door/gi, 'Porta'],
  [/Windows/gi, 'Janelas'],
  [/Window/gi, 'Janela'],
  [/Closets/gi, 'Armários'],
  [/Closet/gi, 'Armário'],
  [/Cabinets/gi, 'Armários / Gabinetes'],
  [/Cabinet/gi, 'Gabinete'],
  [/Missing/gi, 'Faltando / Ausente'],
  [/Adjust hinges/gi, 'Ajustar dobradiças'],
  [/Adjust hinge/gi, 'Ajustar dobradiça'],
  [/Water leak/gi, 'Vazamento de água'],
  [/Leaking/gi, 'Vazando'],
  [/Replace/gi, 'Trocar'],
  [/Repair/gi, 'Consertar'],
  [/Install/gi, 'Instalar'],
  [/Clean/gi, 'Limpar'],
  [/Caulk/gi, 'Calafetar'],
  [/Ceiling/gi, 'Teto / Forro'],
  [/Wall/gi, 'Parede'],
  [/Walls/gi, 'Paredes'],
  [/Floor/gi, 'Piso'],
  [/Flooring/gi, 'Piso / Revestimento'],
  [/Tile/gi, 'Azulejo / Cerâmica'],
  [/Drywall/gi, 'Gesso / Drywall'],
  [/Roof/gi, 'Telhado'],
  [/Gutter/gi, 'Calha'],
  [/Faucet/gi, 'Torneira'],
  [/Sink/gi, 'Pia'],
  [/Toilet/gi, 'Vaso Sanitário'],
  [/Smoke detector/gi, 'Detector de fumaça'],
  [/Deadbolt/gi, 'Fechadura de segurança'],
  [/Lock/gi, 'Fechadura'],
  [/Garage/gi, 'Garagem'],
  [/Kitchen/gi, 'Cozinha'],
  [/Attic/gi, 'Sótão'],
  [/Basement/gi, 'Porão'],
];

/**
 * Traduz descrições e títulos de tarefas em inglês para Português do Brasil (PT-BR)
 */
export function traduzirDescricaoParaPtBr(texto: string): string {
  if (!texto || texto.trim().length === 0) return '';

  let resultado = texto;

  for (const [padrao, traducao] of DICIONARIO_FRASES) {
    resultado = resultado.replace(padrao, traducao);
  }

  // Limpa múltiplos pipes ou espaços duplicados
  resultado = resultado
    .replace(/\|\s*\|/g, '|')
    .replace(/\s+/g, ' ')
    .trim();

  return resultado;
}
