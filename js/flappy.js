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

  //método responsável por implementar o deslocamento dos tubos
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

      //corrdenada x referente ao meio da tela
      const meio = largura / 2;

      //método que verifica se o par de tubos cruzou o meio da tela,
      //denotando a ultrapassagem do obstáculo
      const cruzouOMeio =
        par.getX() + deslocamento >= meio && par.getX() < meio;

      //caso positivo, incrementa o placar
      if (cruzouOMeio) notificarPonto();
    });
  };
}

function Passaro(alturaJogo) {
  let voando = false;

  this.elemento = novoElemento("img", "passaro");
  this.elemento.src = "imgs/passaro.png";

  this.getY = () => parseInt(this.elemento.style.bottom.split("px")[0]);
  this.setY = (y) => (this.elemento.style.bottom = `${y}px`);

  window.onkeydown = (e) => (voando = true);
  window.onkeyup = (e) => (voando = false);

  this.animar = () => {
    const novoY = this.getY() + (voando ? 8 : -5);
    const alturaMaxima = alturaJogo - this.elemento.clientHeight;

    if (novoY <= 0) {
      this.setY(0);
    } else if (novoY >= alturaMaxima) {
      this.setY(alturaMaxima);
    } else {
      this.setY(novoY);
    }
  };

  this.setY(alturaJogo / 2);
}

function Progresso() {
  this.elemento = novoElemento("span", "progresso");
  this.atualizarPontos = (pontos) => {
    this.elemento.innerHTML = pontos;
  };
  this.atualizarPontos(0);
}

// const barreiras = new Barreiras(700, 1200, 200, 400)
// const passaro = new Passaro(700)
// const areaDoJogo = document.querySelector('[wm-flappy]')
// areaDoJogo.appendChild(passaro.elemento)
// areaDoJogo.appendChild(new Progresso().elemento)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)

function estaoSobrepostos(elementoA, elementoB) {
  const a = elementoA.getBoundingClientRect();
  const b = elementoB.getBoundingClientRect();

  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;
  return horizontal && vertical;
}

function colidiu(passaro, barreiras) {
  let colidiu = false;
  barreiras.pares.forEach((parDeBarreiras) => {
    if (!colidiu) {
      const superior = parDeBarreiras.superior.elemento;
      const inferior = parDeBarreiras.inferior.elemento;
      colidiu =
        estaoSobrepostos(passaro.elemento, superior) ||
        estaoSobrepostos(passaro.elemento, inferior);
    }
  });
  return colidiu;
}

function FlappyBird() {
  let pontos = 0;

  const areaDoJogo = document.querySelector("[wm-flappy]");
  const altura = areaDoJogo.clientHeight;
  const largura = areaDoJogo.clientWidth;

  const progresso = new Progresso();
  const barreiras = new Barreiras(altura, largura, 200, 400, () =>
    progresso.atualizarPontos(++pontos)
  );
  const passaro = new Passaro(altura);

  areaDoJogo.appendChild(progresso.elemento);
  areaDoJogo.appendChild(passaro.elemento);
  barreiras.pares.forEach((par) => areaDoJogo.appendChild(par.elemento));

  this.start = () => {
    // loop do jogo
    const temporizador = setInterval(() => {
      barreiras.animar();
      passaro.animar();

      if (colidiu(passaro, barreiras)) {
        clearInterval(temporizador);
      }
    }, 20);
  };
}

new FlappyBird().start();
