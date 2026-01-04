import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  /**
   * Genera una descripción atractiva para un platillo basándose en su nombre
   * Por ahora usa lógica basada en keywords, pero puede integrarse con OpenAI/Claude después
   */
  async generateDishDescription(dishName: string, language: string = 'es'): Promise<string> {
    const nameLower = dishName.toLowerCase();

    // Detectar tipo de comida basado en keywords
    if (nameLower.includes('taco')) {
      return 'Deliciosos tacos preparados con ingredientes frescos y auténticos. Tortilla suave acompañada de carne jugosa, cilantro, cebolla y limón. Una explosión de sabores tradicionales mexicanos.';
    }
    
    if (nameLower.includes('pizza')) {
      return 'Pizza artesanal horneada a la perfección con masa fresca y crujiente. Cubierta con ingredientes de primera calidad y queso mozzarella derretido. Una delicia italiana que no puedes dejar pasar.';
    }
    
    if (nameLower.includes('burger') || nameLower.includes('hamburgue')) {
      return 'Jugosa hamburguesa con carne de res premium, vegetales frescos y nuestras salsas especiales. Servida en pan brioche tostado. El equilibrio perfecto entre sabor y calidad.';
    }
    
    if (nameLower.includes('pasta') || nameLower.includes('espagueti') || nameLower.includes('fettuccine')) {
      return 'Pasta al dente preparada con receta tradicional italiana. Salsa casera elaborada con ingredientes selectos y especias aromáticas. Un plato reconfortante que te transportará a Italia.';
    }
    
    if (nameLower.includes('sushi') || nameLower.includes('roll')) {
      return 'Sushi fresco elaborado con técnicas japonesas auténticas. Pescado de primera calidad y arroz perfectamente sazonado. Una experiencia gastronómica japonesa inolvidable.';
    }
    
    if (nameLower.includes('ensalada') || nameLower.includes('salad')) {
      return 'Ensalada fresca con vegetales de temporada y aderezo casero. Una opción saludable y deliciosa, llena de sabor y nutrientes. Perfecta para acompañar cualquier platillo.';
    }
    
    if (nameLower.includes('postre') || nameLower.includes('pastel') || nameLower.includes('helado') || nameLower.includes('flan')) {
      return 'Delicioso postre elaborado con ingredientes premium. El final perfecto para tu comida, con el balance ideal entre dulzura y textura. Una tentación irresistible.';
    }
    
    if (nameLower.includes('bebida') || nameLower.includes('agua') || nameLower.includes('refresco') || nameLower.includes('jugo')) {
      return 'Bebida refrescante para acompañar tus alimentos. Preparada al momento para garantizar su frescura y sabor. La manera perfecta de complementar tu comida.';
    }
    
    if (nameLower.includes('desayuno') || nameLower.includes('huevo') || nameLower.includes('chilaquil')) {
      return 'Delicioso platillo de desayuno preparado con ingredientes frescos del día. La forma perfecta de comenzar tu mañana con energía y sabor auténtico.';
    }
    
    if (nameLower.includes('carne') || nameLower.includes('bistec') || nameLower.includes('filete')) {
      return 'Corte de carne premium cocinado a tu preferencia. Jugoso y lleno de sabor, acompañado de guarniciones frescas. Una experiencia carnívora excepcional.';
    }
    
    if (nameLower.includes('pollo') || nameLower.includes('chicken')) {
      return 'Pollo tierno y jugoso preparado con nuestra receta especial. Sazonado con hierbas aromáticas y especias seleccionadas. Una opción versátil y deliciosa.';
    }
    
    if (nameLower.includes('mariscos') || nameLower.includes('camarón') || nameLower.includes('pescado')) {
      return 'Mariscos frescos del día preparados con técnicas culinarias refinadas. Sabor del mar en cada bocado con ingredientes de la más alta calidad.';
    }

    // Descripción genérica si no coincide con ninguna categoría
    return `${dishName} - Platillo especial preparado con ingredientes frescos y de calidad. Una deliciosa opción que combina sabor auténtico con presentación cuidada. Perfecto para disfrutar en cualquier ocasión.`;
  }
}
