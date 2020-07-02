## CLIENT

* [ ] Veure una pàgina inicial amb la info de la app
* [ ] Tindre un botó per començar a fer servir la app
* [ ] Formulari Email a migrar
 * [ ] Indicar IP Origen
 * [ ] Indicar IP Destií
 * [ ] Indicar Email
 * [ ] Indicar Contrasenya Origen
 * [ ] Indicar Contrasenya Destí
 * [ ] Indicar el Email que vol que l'avisem
* [ ] Mostrar una cua de gent fent servir la app
* [ ] Botó per ser el primer de la cua
 * [ ] Afegir dades de pagament
 ... 

* [ ] Afegir un formulari per cancelar peticio a traves del ID enviat per correu

## SERVER

* [ ] Disposar de una cua a BD
* [ ] Enviar un correu al client quant el seu email es començi a migrar
* [ ] Enviar un correu amb el ID de cancelació 
* [ ] Executar en un thread apart el ImapSync la llista preminim i si no pel primer de la gratis
    * [ ] Comprovar que el email no esta en cap de les cues 
* [ ] Realitzar Pagament
    * [ ] Montar la passarela de pagament
* [ ] Ficar el client en una llista apart si aquest ha pagat
* [ ] Cancelar una migració donada un ID