create database pesk;
use pesk;

create table user (
	id int auto_increment not null unique,
    nome varchar(255) not null,
    email varchar(255) not null,
	CPF varchar(11) not null,
    tel varchar(11),
    senha varchar(255),
    primary key(id)
);

create table produto (
	id int auto_increment not null unique,
    nome varchar(255) not null,
    descr varchar(500) not null,
    preco decimal(10,2) not null,
    primary key(id)
);

create table pedido (
	nro_pedido int auto_increment not null unique,
    id_cliente int not null,
    status varchar(255) default 'Carrinho',
    primary key (nro_pedido),
    foreign key (id_cliente) references user(id)
);

create table item_pedido (
	nro_pedido int not null,
    id_cliente int not null,
    id_produto int not null,
    qtd int not null,
    primary key(nro_pedido),
    foreign key(nro_pedido) references pedido(nro_pedido),
    foreign key(id_cliente) references user(id),
    foreign key(id_produto) references produto(id)
);