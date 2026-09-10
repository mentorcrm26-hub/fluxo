/**
 * Tradutor especializado em Ordens de Serviço, Construção, Reforma e Manutenção Predial (EN -> PT-BR)
 */

// Mapeamento de frases compostas e expressões comuns (ordem de especificidade decrescente)
const DICIONARIO_FRASES: [RegExp, string][] = [
  // Cabeçalhos, Áreas e Cômodos
  [/\bWhole Home Services and Mechanical Systems\b/gi, 'Serviços Gerais da Casa e Sistemas Mecânicos'],
  [/\bLighting and electrical system\b/gi, 'Iluminação e Sistema Elétrico'],
  [/\bWalls,?\s*ceiling and trim\b/gi, 'Paredes, Teto e Acabamentos'],
  [/\bPatio\/rear entrance\b/gi, 'Pátio / Entrada Traseira'],
  [/\bFront Entryway\b/gi, 'Entrada Principal'],
  [/\bRear Entryway\b/gi, 'Entrada Traseira'],
  [/\bPrimary Bathroom\b/gi, 'Banheiro Principal / Suíte'],
  [/\bMaster Bathroom\b/gi, 'Banheiro Principal / Suíte'],
  [/\bPrimary Bedroom\b/gi, 'Quarto Principal / Suíte'],
  [/\bMaster Bedroom\b/gi, 'Quarto Principal / Suíte'],
  [/\bBathroom One\b/gi, 'Banheiro 1'],
  [/\bBathroom Two\b/gi, 'Banheiro 2'],
  [/\bBathroom Three\b/gi, 'Banheiro 3'],
  [/\bBedroom One\b/gi, 'Quarto 1'],
  [/\bBedroom Two\b/gi, 'Quarto 2'],
  [/\bBedroom Three\b/gi, 'Quarto 3'],
  [/\bBedroom Four\b/gi, 'Quarto 4'],
  [/\bLaundry Room\b/gi, 'Lavanderia'],
  [/\bLiving Room\b/gi, 'Sala de Estar'],
  [/\bDining Room\b/gi, 'Sala de Jantar'],
  [/\bFamily Room\b/gi, 'Sala de Família'],
  [/\bFront Exterior\b/gi, 'Área Externa Frontal'],
  [/\bRear Exterior\b/gi, 'Área Externa Traseira'],
  [/\bLeft Exterior\b/gi, 'Área Externa Esquerda'],
  [/\bRight Exterior\b/gi, 'Área Externa Direita'],
  [/\bHalf Bath\b/gi, 'Lavabo'],
  [/\bWalk-in Closet\b/gi, 'Closet'],

  // Descrições de Serviços e Problemas Específicos
  [/\bfrom bleach cleaning surface\b/gi, 'devido à limpeza da superfície com água sanitária'],
  [/\bbleach cleaning surface\b/gi, 'limpeza de superfície com água sanitária'],
  [/\bbleach clean entryway surface including soffits,?\s*entryway and garage area\b/gi, 'limpar com água sanitária na entrada incluindo beirais, entrada e área da garagem'],
  [/\bbleach clean entryway surface including soffits\.?\s*entryway and garage area\b/gi, 'limpar com água sanitária na entrada incluindo beirais, entrada e área da garagem'],
  [/\bbleach clean(?:ing)?\b/gi, 'limpeza com água sanitária'],
  [/\bcleaning surface\b/gi, 'limpeza da superfície'],
  [/\bpaint chipping from bleach cleaning surface\b/gi, 'tinta descascando devido à limpeza da superfície com água sanitária'],
  [/\bpaint chipping\b/gi, 'tinta descascando'],
  [/\bchipping paint\b/gi, 'tinta descascando'],
  [/\bpeeling paint\b/gi, 'pintura descascando'],
  [/\bpaint for exterior ceiling\b/gi, 'pintar teto/forro externo'],
  [/\bpaint for interior ceiling\b/gi, 'pintar teto/forro interno'],
  [/\bexterior paint\b/gi, 'Pintura Externa'],
  [/\binterior paint\b/gi, 'Pintura Interna'],
  [/\bPower wash walkway\b/gi, 'Lavagem de alta pressão na calçada'],
  [/\bPower wash surface\b/gi, 'Lavagem de alta pressão na superfície'],
  [/\bPower wash(?:ing)?\b/gi, 'Lavagem de alta pressão'],
  [/\bPressure wash(?:ing)?\b/gi, 'Lavagem com lava-jato'],
  [/\bpower wash rear entryway\.?\s*including windows\.?\s*and soffits\b/gi, 'lavagem de alta pressão na entrada traseira, incluindo janelas e beirais'],
  [/\btrim a tree\s*\|\s*trim tree and remove trimmings from home\b/gi, 'podar árvore | podar árvore e recolher podas/galhos da residência'],
  [/\btrim tree and remove trimmings from home\b/gi, 'podar árvore e remover galhos da casa'],
  [/\bTree trimming\b/gi, 'Poda de árvore'],
  [/\bBush trimming\b/gi, 'Poda de arbustos'],
  [/\bspray to match (\d+) walls\.?\s*(\d+)\s*window sills\.?\s*(\d+)\s*step sills\.?\s*(\d+)\s*doors and frames\b/gi, 'aplicar tinta para combinar com $1 paredes, $2 peitoris de janela, $3 soleiras, $4 portas e batentes'],
  [/\bspray to match\b/gi, 'aplicar tinta para combinar com'],
  [/\bPaint Wall to Wall\b/gi, 'Pintar de parede a parede'],
  [/\bPaint Trim\/Base\/Doors \(Specify\)\b/gi, 'Pintar rodapés, guarnições e portas (especificar)'],
  [/\bPaint Trim\/Base\/Doors\b/gi, 'Pintar rodapés, guarnições e portas'],
  [/\bPaint frame\b/gi, 'Pintar batente/moldura'],
  [/\bPaint door frame\b/gi, 'Pintar batente da porta'],
  [/\bFilter replacement needed\b/gi, 'Troca de filtro necessária'],
  [/\bReplace HVAC Filter\b/gi, 'Trocar filtro de ar-condicionado (HVAC)'],
  [/\bHVAC filter\b/gi, 'Filtro de ar-condicionado (HVAC)'],
  [/\bAir filter\b/gi, 'Filtro de ar'],
  [/\binstall (\d+)\s*pack of ([^|]+) filter\b/gi, 'instalar pacote de $1 filtros tamanho $2'],
  [/\b(?:kilz|kitz)\s+spots\b/gi, 'tratar manchas com selador/primer'],
  [/\b(?:kilz|kitz)\s+dried spots on ceiling\b/gi, 'tratar manchas secas no teto com selador Kilz'],
  [/\bDoor does not open\/close smoothly\b/gi, 'Porta não abre/fecha suavemente'],
  [/\badjust door hinge from hitting shower glass door behind it\b/gi, 'ajustar dobradiça da porta para não bater no box de vidro atrás dela'],
  [/\badjust door hinge\.?\s*door hitting wall when opened\b/gi, 'ajustar dobradiça da porta. Porta batendo na parede ao abrir'],
  [/\bDoor off hinges\b/gi, 'Porta fora das dobradiças'],
  [/\badjust hinge from hitting wall\.?\s*door must not touch wall when opened\b/gi, 'ajustar dobradiça para não bater na parede. A porta não deve encostar na parede ao abrir'],
  [/\bAdjust door hinges?\b/gi, 'Ajustar dobradiça(s) da porta'],
  [/\bAdjust hinges?\b/gi, 'Ajustar dobradiça(s)'],
  [/\bGrout worn\/discolored\b/gi, 'Rejunte desgastado ou descolorido'],
  [/\bCaulk wet area\b/gi, 'Calafetar área molhada'],
  [/\bcaulk shower edges\b/gi, 'calafetar bordas do chuveiro/box'],
  [/\bcaulk bathtub\b/gi, 'calafetar banheira'],
  [/\bcaulk sink\b/gi, 'calafetar pia'],
  [/\bHoles\/penetrations\b/gi, 'Furos e perfurações'],
  [/\bCosmetic issue\s*-\s*no vendor action\b/gi, 'Questão estética - sem ação do prestador'],
  [/\bCosmetic issue\b/gi, 'Questão estética'],
  [/\bNo vendor action\b/gi, 'Sem ação do prestador'],
  [/\bpatch hole in closet\b/gi, 'tapar/remendar buraco no armário'],
  [/\bpatch (\d+)\s*small holes in closet wall\b/gi, 'tapar $1 pequenos furos na parede do armário'],
  [/\bpatch and paint\b/gi, 'tapar buraco e pintar'],
  [/\bpatch drywall\b/gi, 'remendar gesso/drywall'],
  [/\bReplace shower handle\b/gi, 'Trocar manopla/registro do chuveiro'],
  [/\btighten shower handle\b/gi, 'apertar registro/manopla do chuveiro'],
  [/\bInstall shelf pins\b/gi, 'Instalar pinos de prateleira'],
  [/\binstall missing corner support\.?\s*match other end of shelving\b/gi, 'instalar suporte de canto ausente para alinhar com o outro lado da prateleira'],
  [/\bNot set in wall\b/gi, 'Não fixado na parede'],
  [/\bremove left over white surge protector from ceiling\b/gi, 'remover filtro de linha/protetor branco pendente no teto'],
  [/\bWrong color\/style\/wattage\b/gi, 'Cor, modelo ou potência incorreta'],
  [/\bReplace (?:light )?bulb\b/gi, 'Trocar lâmpada'],
  [/\breplace (\d+)\s*bulbs to yellow matching home\b/gi, 'trocar $1 lâmpadas para luz amarela combinando com a casa'],
  [/\bSmoke detector\b/gi, 'Detector de fumaça'],
  [/\bCarbon monoxide detector\b/gi, 'Detector de monóxido de carbono'],
  [/\bGarbage disposal\b/gi, 'Triturador de pia'],
  [/\bWater heater\b/gi, 'Aquecedor de água'],
  [/\bCeiling fan\b/gi, 'Ventilador de teto'],
  [/\bLight fixture\b/gi, 'Luminária'],
  [/\bDeadbolt lock\b/gi, 'Fechadura de segurança'],
  [/\bDeadbolt\b/gi, 'Fechadura de segurança'],
  [/\bDoor knob\b/gi, 'Maçaneta da porta'],
  [/\bDoor handle\b/gi, 'Maçaneta / Puxador'],
  [/\bShower head\b/gi, 'Ducha / Chuveiro'],
  [/\bToilet seat\b/gi, 'Assento do vaso sanitário'],
  [/\bWeather stripping\b/gi, 'Vedação de borracha'],
  [/\bWeatherstripping\b/gi, 'Vedação de borracha'],
  [/\bWindow screen\b/gi, 'Tela de janela (mosquiteiro)'],
  [/\bScreen repair\b/gi, 'Conserto da tela mosquiteiro'],
  [/\bTrash out\b/gi, 'Remoção de entulho / lixo'],
  [/\bDebris removal\b/gi, 'Remoção de resíduos/entulho'],
  [/\bDeep clean\b/gi, 'Limpeza pesada'],
  [/\bTouch up\b/gi, 'Retoque'],
  [/\bTouch-up\b/gi, 'Retoque'],
  [/\bLawn care\b/gi, 'Manutenção do gramado'],
  [/\bMow lawn\b/gi, 'Cortar grama'],
  [/\bWeed removal\b/gi, 'Remoção de ervas daninhas / Capina'],
  [/\bPull weeds\b/gi, 'Remover mato / capinar'],
  [/\bWindow sills?\b/gi, 'Peitoril de janela'],
  [/\bStep sills?\b/gi, 'Soleira de degrau'],
  [/\bDoors and frames\b/gi, 'Portas e batentes'],
  [/\bSliding glass door\b/gi, 'Porta de correr de vidro'],
  [/\bSliding door\b/gi, 'Porta de correr'],
  [/\bGarage door\b/gi, 'Portão da garagem'],
  [/\bKitchen sink\b/gi, 'Pia da cozinha'],
  [/\bBathroom sink\b/gi, 'Pia do banheiro'],
  [/\bService needed\b/gi, 'Serviço necessário'],
  [/\bNot working\b/gi, 'Não está funcionando'],
  [/\bInoperable\b/gi, 'Inoperante / Com defeito'],

  // Substantivos e Elementos Construtivos
  [/\bRepainting\b/gi, 'Repintura'],
  [/\bPainting\b/gi, 'Pintura'],
  [/\bPaint\b/gi, 'Pintura'],
  [/\bLandscaping\b/gi, 'Paisagismo / Jardim'],
  [/\bOvergrown\b/gi, 'Mato alto / Crescido'],
  [/\bDebris\b/gi, 'Entulho / Resíduos'],
  [/\bBleach\b/gi, 'Água Sanitária'],
  [/\bSurface\b/gi, 'Superfície'],
  [/\bSurfaces\b/gi, 'Superfícies'],
  [/\bWorn\b/gi, 'Desgaste'],
  [/\bDamaged\b/gi, 'Danificado'],
  [/\bBroken\b/gi, 'Quebrado'],
  [/\bDirty\b/gi, 'Sujo'],
  [/\bStained\b/gi, 'Manchado'],
  [/\bChipped\b/gi, 'Lascado'],
  [/\bChipping\b/gi, 'Descascando'],
  [/\bPeeling\b/gi, 'Descascando'],
  [/\bCracked\b/gi, 'Rachado / Trincado'],
  [/\bLoose\b/gi, 'Solto / Frouxo'],
  [/\bMissing\b/gi, 'Ausente / Faltando'],
  [/\bWater leak\b/gi, 'Vazamento de água'],
  [/\bLeaking\b/gi, 'Vazando'],
  [/\bLeak\b/gi, 'Vazamento'],
  [/\bClogged\b/gi, 'Entupido'],
  [/\bRusted\b/gi, 'Enferrujado'],
  [/\bCorroded\b/gi, 'Corroído'],
  [/\bRotten\b/gi, 'Apodrecido / Podre'],
  [/\bBurnt out\b/gi, 'Queimada'],
  [/\bShower\b/gi, 'Chuveiro / Box'],
  [/\bDoors\b/gi, 'Portas'],
  [/\bDoor\b/gi, 'Porta'],
  [/\bWindows\b/gi, 'Janelas'],
  [/\bWindow\b/gi, 'Janela'],
  [/\bClosets\b/gi, 'Armários'],
  [/\bCloset\b/gi, 'Armário'],
  [/\bCabinets\b/gi, 'Armários / Gabinetes'],
  [/\bCabinet\b/gi, 'Gabinete'],
  [/\bDrawers\b/gi, 'Gavetas'],
  [/\bDrawer\b/gi, 'Gaveta'],
  [/\bCountertop\b/gi, 'Bancada'],
  [/\bSoffits\b/gi, 'Beirais'],
  [/\bSoffit\b/gi, 'Beiral'],
  [/\bFascia\b/gi, 'Testeira'],
  [/\bGutters\b/gi, 'Calhas'],
  [/\bGutter\b/gi, 'Calha'],
  [/\bDownspouts\b/gi, 'Condutores pluviais'],
  [/\bDownspout\b/gi, 'Condutor pluvial'],
  [/\bCeiling\b/gi, 'Teto / Forro'],
  [/\bWalls\b/gi, 'Paredes'],
  [/\bWall\b/gi, 'Parede'],
  [/\bFlooring\b/gi, 'Piso / Revestimento'],
  [/\bFloor\b/gi, 'Piso'],
  [/\bTiles\b/gi, 'Azulejos / Cerâmica'],
  [/\bTile\b/gi, 'Azulejo / Cerâmica'],
  [/\bDrywall\b/gi, 'Gesso / Drywall'],
  [/\bRoof\b/gi, 'Telhado'],
  [/\bFaucet\b/gi, 'Torneira'],
  [/\bSink\b/gi, 'Pia'],
  [/\bToilet\b/gi, 'Vaso Sanitário'],
  [/\bBathtub\b/gi, 'Banheira'],
  [/\bTub\b/gi, 'Banheira'],
  [/\bMirror\b/gi, 'Espelho'],
  [/\bVanity\b/gi, 'Gabinete do banheiro'],
  [/\bOutlet\b/gi, 'Tomada'],
  [/\bSwitch\b/gi, 'Interruptor'],
  [/\bBulbs\b/gi, 'Lâmpadas'],
  [/\bBulb\b/gi, 'Lâmpada'],
  [/\bLock\b/gi, 'Fechadura'],
  [/\bHinges\b/gi, 'Dobradiças'],
  [/\bHinge\b/gi, 'Dobradiça'],
  [/\bGrout\b/gi, 'Rejunte'],
  [/\bCaulk\b/gi, 'Calafetar'],
  [/\bGarage\b/gi, 'Garagem'],
  [/\bKitchen\b/gi, 'Cozinha'],
  [/\bAttic\b/gi, 'Sótão'],
  [/\bBasement\b/gi, 'Porão'],
  [/\bBackyard\b/gi, 'Quintal'],
  [/\bDriveway\b/gi, 'Entrada de carros'],
  [/\bWalkway\b/gi, 'Calçada / Passarela'],
  [/\bSidewalk\b/gi, 'Calçada'],
  [/\bFence\b/gi, 'Cerca'],
  [/\bGate\b/gi, 'Portão'],
  [/\bBaseboard\b/gi, 'Rodapé'],
  [/\bBaseboards\b/gi, 'Rodapés'],
  [/\bTrim\b/gi, 'Acabamento / Guarnição'],

  // Verbos de Ação
  [/\bReplace\b/gi, 'Trocar'],
  [/\bRepair\b/gi, 'Consertar'],
  [/\bInstall\b/gi, 'Instalar'],
  [/\bClean\b/gi, 'Limpar'],
  [/\bRemove\b/gi, 'Remover'],
  [/\bAdjust\b/gi, 'Ajustar'],
  [/\bTighten\b/gi, 'Apertar'],
  [/\bScrape\b/gi, 'Raspar'],
  [/\bPrime\b/gi, 'Passar primer / selador'],
  [/\bSecure\b/gi, 'Fixar'],
  [/\bPatch\b/gi, 'Tapar buraco / Remendar'],
];

/**
 * Remove ruídos, cabeçalhos repetidos e dados de rodapé de planilhas/PDFs
 */
function limparRuidoTexto(texto: string): string {
  return texto
    .replace(/\bTotal\s+(?:[\d,.]+\s+)?Description[\s\S]*/gi, '')
    .replace(/\bTotal\s+Description[\s\S]*/gi, '')
    .replace(/\b(?:FL|PROP)\d+\b[\s\S]*/gi, '')
    .replace(/\|\s*[A-Z][a-z]+\s+[A-Z][a-z]+\s*\|?$/g, '')
    .replace(/\b\d{5}(?:-\d{4})?\s*\|[\s\S]*/gi, '')
    .replace(/By accepting or performing[\s\S]*/gi, '')
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}:\d{2}\s*(AM|PM)?/gi, '')
    .replace(/\b(PO Closed\?|GL Review|Pending)\b/gi, '')
    .trim();
}

/**
 * Traduz descrições e títulos de tarefas em inglês para Português do Brasil (PT-BR)
 */
export function traduzirDescricaoParaPtBr(texto: string): string {
  if (!texto || texto.trim().length === 0) return '';

  // 1. Limpa ruídos de metadados do PDF/ordem de serviço
  let limpo = limparRuidoTexto(texto);
  if (!limpo) limpo = texto.trim();

  // Insere espaço após ponto/vírgula se colado em letras (ex: "worn.paint" -> "worn. paint")
  limpo = limpo.replace(/([a-zA-Z])\.([a-zA-Z])/g, '$1. $2');

  // 2. Separa por segmentos de pipe (|) para traduzir e deduplicar partes repetidas
  const segmentos = limpo
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Deduplica segmentos idênticos (case-insensitive)
  const segmentosUnicos: string[] = [];
  const vistos = new Set<string>();

  for (const seg of segmentos) {
    const chave = seg.toLowerCase().replace(/[^\w]/g, '');
    if (!chave || vistos.has(chave)) continue;
    vistos.add(chave);
    segmentosUnicos.push(seg);
  }

  // Se não houver pipes, usa o texto original limpo
  const textoParaTraduzir = segmentosUnicos.length > 0 ? segmentosUnicos.join(' | ') : limpo;

  let resultado = textoParaTraduzir;

  // 3. Aplica regras do dicionário
  for (const [padrao, traducao] of DICIONARIO_FRASES) {
    resultado = resultado.replace(padrao, traducao);
  }

  // 4. Formata e limpa delimitadores duplicados ou espaços extras
  resultado = resultado
    .replace(/\|\s*\|+/g, '|')
    .replace(/\s*\|\s*/g, ' | ')
    .replace(/\s+/g, ' ')
    .replace(/\.\s*\./g, '.')
    .replace(/^\|\s*|\s*\|$/g, '')
    .trim();

  return resultado;
}
