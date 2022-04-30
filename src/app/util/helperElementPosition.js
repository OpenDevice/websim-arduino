// Função para ajudar a posicionar o elemento na tela. 
// Adcione a classe: .helper-move e chame essa função no console.
function helperElementPosition(){

    var mousePosition;
    var offset = [0,0];
    var div;
    var isDown = false;

    div = document.querySelector(".helper-move");

  
    div.addEventListener('mousedown', function(e) {
        isDown = true;
        offset = [
            div.offsetLeft - e.clientX,
            div.offsetTop - e.clientY
        ];
    }, true);

    document.addEventListener('mouseup', function() {
        isDown = false;
        console.log("top: %s; left: %s", div.style.top, div.style.left);
    }, true);

    document.addEventListener('mousemove', function(event) {
        event.preventDefault();
        if (isDown) {
            mousePosition = {

                x : event.clientX,
                y : event.clientY

            };
            div.style.left = (mousePosition.x + offset[0]) + 'px';
            div.style.top  = (mousePosition.y + offset[1]) + 'px';
        }
    }, true);

}
