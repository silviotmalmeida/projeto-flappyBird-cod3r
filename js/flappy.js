function novoElemento(tagName, className) {
  //função responsável por criar um novo elemento html

  //criando um novo elemento da tag
  const elem = document.createElement(tagName);

  //atribuindo uma classe para o elemento criado
  elem.className = className;

  //retornando o elemento criado
  return elem;
}

function Barreira(reversa = false) {
  //função construtora responsável pela criação dos tubos
  //o parâmetro deve ser true para tubo superior e false para tubo inferior

  //criando a div que vai conter o corpo e a borda do tubo
  this.elemento = novoElemento("div", "barreira");

  //criando a borda do tubo
  const borda = novoElemento("div", "borda");

  //criando o corpo do tubo
  const corpo = novoElemento("div", "corpo");

  //inserindo a borda e o corpo na div principal
  this.elemento.appendChild(reversa ? corpo : borda);
  this.elemento.appendChild(reversa ? borda : corpo);

  //método que parametriza a altura do corpo do tubo
  this.setAltura = (altura) => (corpo.style.height = `${altura}px`);
}

function ParDeBarreiras(altura, abertura, x) {
  //função construtora responsável pela criação do par de tubos

  //criando a div que vai conter os dois tubos
  this.elemento = novoElemento("div", "par-de-barreiras");

  //criando o tubo superior
  this.superior = new Barreira(true);

  //criando o tubo inferior
  this.inferior = new Barreira(false);

  //inserindo os tubos na div principal
  this.elemento.appendChild(this.superior.elemento);
  this.elemento.appendChild(this.inferior.elemento);

  //método responsável por definir tamanhos randômicos para os tubos
  this.sortearAbertura = () => {
    //definindo randomicamente o tamanho do tubo superior
    const alturaSuperior = Math.random() * (altura - abertura);

    //definindo o tamanho do tubo inferior a partir do tubo superior
    const alturaInferior = altura - abertura - alturaSuperior;

    //atribuindo os tamanhos aos tubos
    this.superior.setAltura(alturaSuperior);
    this.inferior.setAltura(alturaInferior);
  };

  //método get da coordenada x dos tubos
  this.getX = () => parseInt(this.elemento.style.left.split("px")[0]);

  //método set da coordenada x dos tubos
  this.setX = (x) => (this.elemento.style.left = `${x}px`);

  //método get da largura dos tubos
  this.getLargura = () => this.elemento.clientWidth;

  //definindo os tamanhos dos tubos
  this.sortearAbertura();

  //atribuindo a coordenada x do objeto conforme parâmetro informado
  this.setX(x);
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
  //função construtora responsável pela criação do total de par de tubos

  //criando um array com os pares de tubos
  this.pares = [
    new ParDeBarreiras(altura, abertura, largura),
    new ParDeBarreiras(altura, abertura, largura + espaco),
    new ParDeBarreiras(altura, abertura, largura + espaco * 2),
    new ParDeBarreiras(altura, abertura, largura + espaco * 3),
  ];

  //passo do deslocamento dos tubos
  const deslocamento = 3;

  //método responsável por implementar o deslocamento dos tubos a cada passo
  this.animar = () => {
    //percorrendo o array de tubos e aplicando o passo do deslocamento
    this.pares.forEach((par) => {
      par.setX(par.getX() - deslocamento);

      // quando o elemento sair da área do jogo (x < largura negativa),
      if (par.getX() < -par.getLargura()) {
        //redesenha o par de tubos na posição inicial
        par.setX(par.getX() + espaco * this.pares.length);

        // recalcula o tamanho do par de tubos
        par.sortearAbertura();
      }

      //coordenada x referente ao meio da tela
      const meio = largura / 2;

      //método que verifica se o par de tubos cruzou o meio da tela,
      //denotando a ultrapassagem do obstáculo
      const cruzouOMeio =
        par.getX() + deslocamento >= meio && par.getX() < meio;

      //caso positivo, chama a callback e incrementa o placar
      if (cruzouOMeio) notificarPonto();
    });
  };
}

function Passaro(alturaJogo) {
  //função construtora responsável pela criação do pássaro

  //inicializando a variável voando
  let voando = false;

  //criando o elemento pássaro
  this.elemento = novoElemento("img", "passaro");
  this.elemento.src = "imgs/passaro.png";

  //método get da coordenada y do pássaro
  this.getY = () => parseInt(this.elemento.style.bottom.split("px")[0]);

  //método set da coordenada y do pássaro
  this.setY = (y) => (this.elemento.style.bottom = `${y}px`);

  //definindo o comportamento ao pressionar a tecla
  window.onkeydown = (e) => (voando = true);

  //definindo o comportamento ao soltar a tecla
  window.onkeyup = (e) => (voando = false);

  //método responsável por implementar o deslocamento do pássaro a cada passo
  this.animar = () => {
    //calculando o próximo valor de y
    //caso alguma tecla esteja pressionada, soma 8
    //caso nenhuma tecla esteja pressionada, subtrai 5
    const novoY = this.getY() + (voando ? 8 : -5);

    //calculando o y máximo admissível
    const alturaMaxima = alturaJogo - this.elemento.clientHeight;

    //caso o novo y seja negativo:
    if (novoY <= 0) {
      //seta o novo y em zero
      this.setY(0);

      //caso seja maior ou igual ao máximo y admissível:
    } else if (novoY >= alturaMaxima) {
      //seta no máximo y admissível
      this.setY(alturaMaxima);

      //senão:
    } else {
      //seta o valor calculado
      this.setY(novoY);
    }
  };

  //setando a posição inicial central do pássaro
  this.setY(alturaJogo / 2);
}

function Progresso() {
  //função construtora responsável pela criação do placar

  //criando o elemento placar
  this.elemento = novoElemento("span", "progresso");

  //método que atualiza o valor exibido no placar
  this.atualizarPontos = (pontos) => {
    this.elemento.innerHTML = pontos;
  };

  //iniciando o placar em zero
  this.atualizarPontos(0);
}

function estaoSobrepostos(elementoA, elementoB) {
  //funçao que verifica se dois elementos estão sobrepostos

  //obtendo as coordenadas do retângulo associado ao elemento A
  const a = elementoA.getBoundingClientRect();

  //obtendo as coordenadas do retângulo associado ao  elemento B
  const b = elementoB.getBoundingClientRect();

  //verificando colisão no eixo x
  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;

  //verificando colisão no eixo y
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;

  //retorna true ou false
  return horizontal && vertical;
}

function colidiu(passaro, barreiras) {
  //função verifica se houve colisão entre o pássaro e as barreiras

  //inicializando como false
  let colidiu = false;

  //verifica a existência de colisão para cada uma dos pares de barreiras
  barreiras.pares.forEach((parDeBarreiras) => {
    //se ainda não colidiu:
    if (!colidiu) {
      //obtendo a referencia da barreira superior
      const superior = parDeBarreiras.superior.elemento;

      //obtendo a referencia da barreira inferior
      const inferior = parDeBarreiras.inferior.elemento;

      //verificando a existência de colisão superior ou inferior
      colidiu =
        estaoSobrepostos(passaro.elemento, superior) ||
        estaoSobrepostos(passaro.elemento, inferior);
    }
  });

  //retorna true ou false
  return colidiu;
}

function FlappyBird() {
  //função responsável por criar o jogo

  //inicializando o placar
  let pontos = 0;

  //definindo a div onde será construído o jogo
  const areaDoJogo = document.querySelector("[wm-flappy]");

  //obtendo a altura da div, que será a altura do jogo
  const altura = areaDoJogo.clientHeight;

  //obtendo a largura da div, que será a largura do jogo
  const largura = areaDoJogo.clientWidth;

  //criando o placar
  const progresso = new Progresso();

  //criando as barreiras e definindo a callback de atualização do placar
  const barreiras = new Barreiras(altura, largura, 200, 400, () =>
    progresso.atualizarPontos(++pontos)
  );

  //criando o pássaro
  const passaro = new Passaro(altura);

  //inserindo o placar no jogo
  areaDoJogo.appendChild(progresso.elemento);

  //inserindo o pássaro no jogo
  areaDoJogo.appendChild(passaro.elemento);

  //inserindo as barreiras no jogo
  barreiras.pares.forEach((par) => areaDoJogo.appendChild(par.elemento));

  //método responsável por iniciar o jogo
  this.start = () => {
    // loop do jogo, atualizado a cada 20ms
    const temporizador = setInterval(() => {
      //animando as barreiras
      barreiras.animar();

      //animando o pássaro
      passaro.animar();

      //implementando o fim do jogo ao detectar uma colisão
      if (colidiu(passaro, barreiras)) {
        //pára imediatamente o jogo
        clearInterval(temporizador);
      }
    }, 20);
  };
}

//criando o jogo
new FlappyBird().start();
