function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}  

function map(source, in_min , in_max , out_min , out_max) {
  return ( source - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
}